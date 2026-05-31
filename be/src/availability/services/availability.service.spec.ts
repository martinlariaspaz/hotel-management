import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Types, type Model } from "mongoose";
import {
  MaintenanceBlockStatus,
  ReservationStatus,
  RoomStatus,
} from "../../common/enums";
import { HotelBusinessConflictException } from "../../common/errors";
import type { MaintenanceBlockDocument } from "../../maintenance-blocks/schemas";
import {
  ReservationSource,
  type ReservationDocument,
} from "../../reservations/schemas";
import type { RoomTypeDocument } from "../../room-types/schemas/room-type.schema";
import type { RoomDocument } from "../../rooms/schemas";
import { AvailabilityService } from "./availability.service";

const STANDARD_ROOM_TYPE_ID = "507f1f77bcf86cd799439011";
const SUITE_ROOM_TYPE_ID = "507f1f77bcf86cd799439012";
const ROOM_101_ID = "507f1f77bcf86cd799439013";
const ROOM_102_ID = "507f1f77bcf86cd799439014";
const ROOM_103_ID = "507f1f77bcf86cd799439015";
const ROOM_104_ID = "507f1f77bcf86cd799439016";
const ROOM_201_ID = "507f1f77bcf86cd799439017";
const RESERVATION_ID = "507f1f77bcf86cd799439018";
const CURRENT_RESERVATION_ID = "507f1f77bcf86cd799439019";

type RoomTypeDocumentStub = Pick<
  RoomTypeDocument,
  | "_id"
  | "amenities"
  | "baseNightlyRate"
  | "capacity"
  | "isActive"
  | "name"
  | "photoUrls"
>;

type RoomDocumentStub = Pick<
  RoomDocument,
  "_id" | "floor" | "roomNumber" | "roomType" | "status"
>;

type ReservationDocumentStub = Pick<
  ReservationDocument,
  "_id" | "room" | "roomType"
>;

type MaintenanceBlockDocumentStub = Pick<MaintenanceBlockDocument, "room">;

function createQueryChain<TValue>(value: TValue) {
  const chain = {
    exec: async () => value,
    select: () => chain,
    sort: () => chain,
  };

  return chain;
}

function createExecChain<TValue>(value: TValue) {
  return {
    exec: async () => value,
  };
}

function createUpdateManyChain() {
  return {
    exec: async () => ({ modifiedCount: 0 }),
  };
}

function createRoomTypeDocument(
  overrides: Partial<RoomTypeDocumentStub> = {},
): RoomTypeDocumentStub {
  return {
    _id: new Types.ObjectId(STANDARD_ROOM_TYPE_ID),
    name: "Standard",
    capacity: 2,
    amenities: ["Wi-Fi"],
    photoUrls: ["https://example.com/standard.jpg"],
    baseNightlyRate: 90000,
    isActive: true,
    ...overrides,
  };
}

function createRoomDocument(
  overrides: Partial<RoomDocumentStub> = {},
): RoomDocumentStub {
  return {
    _id: new Types.ObjectId(ROOM_101_ID),
    roomNumber: "101",
    floor: "1",
    roomType: new Types.ObjectId(STANDARD_ROOM_TYPE_ID),
    status: RoomStatus.Available,
    ...overrides,
  };
}

function createReservationDocument(
  overrides: Partial<ReservationDocumentStub> = {},
): ReservationDocumentStub {
  return {
    _id: new Types.ObjectId(RESERVATION_ID),
    roomType: new Types.ObjectId(STANDARD_ROOM_TYPE_ID),
    ...overrides,
  };
}

function createMaintenanceBlockDocument(
  roomId: string,
): MaintenanceBlockDocumentStub {
  return {
    room: new Types.ObjectId(roomId),
  };
}

describe("AvailabilityService", () => {
  it("returns public room type availability after subtracting reservations and blocked rooms", async () => {
    let roomTypeFilters: unknown;
    let roomFilters: unknown;
    let reservationFilters: unknown;
    let reservationExpiryFilters: unknown;
    let reservationExpiryUpdate: unknown;
    let maintenanceFilters: unknown;
    const standardRoomType = createRoomTypeDocument();
    const suiteRoomType = createRoomTypeDocument({
      _id: new Types.ObjectId(SUITE_ROOM_TYPE_ID),
      name: "Suite",
      capacity: 4,
      amenities: ["Wi-Fi", "Balcony"],
      photoUrls: ["https://example.com/suite.jpg"],
      baseNightlyRate: 150000,
    });
    const service = new AvailabilityService(
      {
        find: (filters: unknown) => {
          roomTypeFilters = filters;

          return createQueryChain([standardRoomType, suiteRoomType]);
        },
      } as unknown as Model<RoomTypeDocument>,
      {
        find: (filters: unknown) => {
          roomFilters = filters;

          return createQueryChain([
            createRoomDocument({ _id: new Types.ObjectId(ROOM_101_ID) }),
            createRoomDocument({
              _id: new Types.ObjectId(ROOM_102_ID),
              roomNumber: "102",
            }),
            createRoomDocument({
              _id: new Types.ObjectId(ROOM_103_ID),
              roomNumber: "103",
              status: RoomStatus.OutOfService,
            }),
            createRoomDocument({
              _id: new Types.ObjectId(ROOM_104_ID),
              roomNumber: "104",
            }),
            createRoomDocument({
              _id: new Types.ObjectId(ROOM_201_ID),
              roomNumber: "201",
              floor: "2",
              roomType: new Types.ObjectId(SUITE_ROOM_TYPE_ID),
            }),
          ]);
        },
      } as unknown as Model<RoomDocument>,
      {
        updateMany: (filters: unknown, update: unknown) => {
          reservationExpiryFilters = filters;
          reservationExpiryUpdate = update;

          return createUpdateManyChain();
        },
        find: (filters: unknown) => {
          reservationFilters = filters;

          return createQueryChain([
            createReservationDocument({
              roomType: new Types.ObjectId(STANDARD_ROOM_TYPE_ID),
            }),
            createReservationDocument({
              _id: new Types.ObjectId("507f1f77bcf86cd799439020"),
              room: new Types.ObjectId(ROOM_201_ID),
              roomType: new Types.ObjectId(SUITE_ROOM_TYPE_ID),
            }),
          ]);
        },
      } as unknown as Model<ReservationDocument>,
      {
        find: (filters: unknown) => {
          maintenanceFilters = filters;

          return createQueryChain([
            createMaintenanceBlockDocument(ROOM_102_ID),
          ]);
        },
      } as unknown as Model<MaintenanceBlockDocument>,
    );

    const availability = await service.getPublicAvailability({
      checkIn: "2026-06-01",
      checkOut: "2026-06-04",
      guests: 2,
    });

    assert.deepEqual(roomTypeFilters, {
      isActive: true,
      capacity: { $gte: 2 },
    });
    assert.deepEqual(
      (roomFilters as { status: { $nin: RoomStatus[] } }).status.$nin,
      [RoomStatus.Maintenance, RoomStatus.OutOfService],
    );

    const reservationDateFilters = reservationFilters as {
      $or: unknown[];
      checkInDate: { $lt: Date };
      checkOutDate: { $gt: Date };
      status: { $in: ReservationStatus[] };
    };
    assert.deepEqual(reservationDateFilters.status.$in, [
      ReservationStatus.PendingConfirmation,
      ReservationStatus.Confirmed,
      ReservationStatus.CheckedIn,
    ]);
    assert.deepEqual(
      reservationDateFilters.checkInDate.$lt,
      new Date("2026-06-04T00:00:00.000Z"),
    );
    assert.deepEqual(
      reservationDateFilters.checkOutDate.$gt,
      new Date("2026-06-01T00:00:00.000Z"),
    );
    assert.deepEqual(reservationDateFilters.$or.slice(0, 3), [
      { status: { $ne: ReservationStatus.PendingConfirmation } },
      { source: { $ne: ReservationSource.Public } },
      { expiresAt: { $exists: false } },
    ]);
    assert.ok(
      (reservationDateFilters.$or[3] as { expiresAt: { $gt: Date } }).expiresAt
        .$gt instanceof Date,
    );

    const expiryFilters = reservationExpiryFilters as {
      expiredAt: { $exists: boolean };
      expiresAt: { $lte: Date };
      source: string;
      status: ReservationStatus;
    };
    const expiryUpdate = reservationExpiryUpdate as {
      $set: { expiredAt: Date; status: ReservationStatus };
    };
    assert.equal(expiryFilters.status, ReservationStatus.PendingConfirmation);
    assert.equal(expiryFilters.source, ReservationSource.Public);
    assert.deepEqual(expiryFilters.expiredAt, { $exists: false });
    assert.equal(expiryUpdate.$set.status, ReservationStatus.Cancelled);
    assert.equal(
      expiryUpdate.$set.expiredAt.getTime(),
      expiryFilters.expiresAt.$lte.getTime(),
    );

    const maintenanceDateFilters = maintenanceFilters as {
      endDate: { $gt: Date };
      startDate: { $lt: Date };
      status: MaintenanceBlockStatus;
    };
    assert.equal(maintenanceDateFilters.status, MaintenanceBlockStatus.Active);
    assert.deepEqual(
      maintenanceDateFilters.startDate.$lt,
      new Date("2026-06-04T00:00:00.000Z"),
    );
    assert.deepEqual(
      maintenanceDateFilters.endDate.$gt,
      new Date("2026-06-01T00:00:00.000Z"),
    );
    assert.equal(availability.nights, 3);
    assert.equal(availability.currency, "ARS");
    assert.deepEqual(
      availability.roomTypes.map((roomType) => ({
        availableCount: roomType.availableCount,
        depositAmount: roomType.depositRule.amount,
        id: roomType.id,
        total: roomType.priceSummary.total,
      })),
      [
        {
          id: STANDARD_ROOM_TYPE_ID,
          availableCount: 1,
          depositAmount: 90000,
          total: 270000,
        },
        {
          id: SUITE_ROOM_TYPE_ID,
          availableCount: 0,
          depositAmount: 150000,
          total: 450000,
        },
      ],
    );
  });

  it("returns assignable physical rooms excluding active blocks and conflicting assignments", async () => {
    let reservationFilters: unknown;
    const standardRoomType = createRoomTypeDocument();
    const service = new AvailabilityService(
      {
        findOne: (filters: unknown) => {
          assert.deepEqual(filters, {
            _id: new Types.ObjectId(STANDARD_ROOM_TYPE_ID),
            isActive: true,
          });

          return createExecChain(standardRoomType);
        },
      } as unknown as Model<RoomTypeDocument>,
      {
        find: (filters: unknown) => {
          assert.deepEqual(filters, {
            roomType: new Types.ObjectId(STANDARD_ROOM_TYPE_ID),
            status: {
              $nin: [RoomStatus.Maintenance, RoomStatus.OutOfService],
            },
          });

          return createQueryChain([
            createRoomDocument({ _id: new Types.ObjectId(ROOM_101_ID) }),
            createRoomDocument({
              _id: new Types.ObjectId(ROOM_102_ID),
              roomNumber: "102",
            }),
            createRoomDocument({
              _id: new Types.ObjectId(ROOM_103_ID),
              roomNumber: "103",
            }),
            createRoomDocument({
              _id: new Types.ObjectId(ROOM_104_ID),
              roomNumber: "104",
              status: RoomStatus.OutOfService,
            }),
          ]);
        },
      } as unknown as Model<RoomDocument>,
      {
        updateMany: () => createUpdateManyChain(),
        find: (filters: unknown) => {
          reservationFilters = filters;

          return createQueryChain([
            createReservationDocument({
              room: new Types.ObjectId(ROOM_101_ID),
            }),
          ]);
        },
      } as unknown as Model<ReservationDocument>,
      {
        find: () =>
          createQueryChain([createMaintenanceBlockDocument(ROOM_102_ID)]),
      } as unknown as Model<MaintenanceBlockDocument>,
    );

    const response = await service.getAssignableRooms({
      roomTypeId: STANDARD_ROOM_TYPE_ID,
      checkIn: "2026-06-01",
      checkOut: "2026-06-03",
      guests: 2,
      reservationId: CURRENT_RESERVATION_ID,
    });

    const filters = reservationFilters as {
      _id: { $ne: Types.ObjectId };
      room: { $in: Types.ObjectId[] };
    };
    assert.equal(filters._id.$ne.toString(), CURRENT_RESERVATION_ID);
    assert.deepEqual(
      filters.room.$in.map((roomId) => roomId.toString()),
      [ROOM_101_ID, ROOM_102_ID, ROOM_103_ID, ROOM_104_ID],
    );
    assert.deepEqual(response.rooms, [
      {
        id: ROOM_103_ID,
        roomNumber: "103",
        floor: "1",
        status: RoomStatus.Available,
        roomType: {
          id: STANDARD_ROOM_TYPE_ID,
          name: "Standard",
          capacity: 2,
        },
      },
    ]);
  });

  it("rejects assignable-room requests that exceed room type capacity", async () => {
    const service = new AvailabilityService(
      {
        findOne: () => createExecChain(createRoomTypeDocument({ capacity: 2 })),
      } as unknown as Model<RoomTypeDocument>,
      {} as Model<RoomDocument>,
      {} as Model<ReservationDocument>,
      {} as Model<MaintenanceBlockDocument>,
    );

    await assert.rejects(
      () =>
        service.getAssignableRooms({
          roomTypeId: STANDARD_ROOM_TYPE_ID,
          checkIn: "2026-06-01",
          checkOut: "2026-06-03",
          guests: 3,
        }),
      HotelBusinessConflictException,
    );
  });
});
