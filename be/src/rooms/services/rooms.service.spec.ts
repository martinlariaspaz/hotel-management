import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Types, type Model } from "mongoose";
import { RoomStatus, UserRole } from "../../common/enums";
import type { RoomTypeDocument } from "../../room-types/schemas/room-type.schema";
import type { RoomDocument } from "../schemas";
import { RoomsService } from "./rooms.service";

const ROOM_ID = "507f1f77bcf86cd799439011";
const ROOM_TYPE_ID = "507f1f77bcf86cd799439012";

type RoomDocumentStub = Pick<
  RoomDocument,
  "_id" | "floor" | "notes" | "roomNumber" | "status"
> & {
  roomType: Pick<
    RoomTypeDocument,
    "_id" | "capacity" | "isActive" | "name"
  >;
};

function createRoomDocument(
  overrides: Partial<RoomDocumentStub> = {},
): RoomDocumentStub {
  return {
    _id: new Types.ObjectId(ROOM_ID),
    roomNumber: "101",
    floor: "1",
    notes: "Near elevator",
    status: RoomStatus.Available,
    roomType: {
      _id: new Types.ObjectId(ROOM_TYPE_ID),
      name: "Standard",
      capacity: 2,
      isActive: true,
    } as RoomDocumentStub["roomType"],
    ...overrides,
  };
}

function createPopulatedExecChain<TValue>(value: TValue) {
  return {
    populate: () => ({
      exec: async () => value,
    }),
  };
}

describe("RoomsService", () => {
  it("lists staff rooms with status, room type, and floor filters", async () => {
    let receivedFilters: unknown;
    const service = new RoomsService(
      {
        find: (filters: unknown) => {
          receivedFilters = filters;

          return {
            populate: () => ({
              sort: () => ({
                exec: async () => [createRoomDocument()],
              }),
            }),
          };
        },
      } as unknown as Model<RoomDocument>,
      {} as Model<RoomTypeDocument>,
    );

    const rooms = await service.listRooms({
      status: RoomStatus.Available,
      roomTypeId: ROOM_TYPE_ID,
      floor: "1",
    });

    assert.deepEqual(receivedFilters, {
      status: RoomStatus.Available,
      roomType: ROOM_TYPE_ID,
      floor: "1",
    });
    assert.deepEqual(rooms, [
      {
        id: ROOM_ID,
        roomNumber: "101",
        floor: "1",
        notes: "Near elevator",
        status: RoomStatus.Available,
        roomType: {
          id: ROOM_TYPE_ID,
          name: "Standard",
          capacity: 2,
          isActive: true,
        },
      },
    ]);
  });

  it("creates rooms after validating the active room type exists", async () => {
    let createdPayload: Record<string, unknown> | null = null;
    const service = new RoomsService(
      {
        create: async (payload: Record<string, unknown>) => {
          createdPayload = payload;

          return {
            _id: new Types.ObjectId(ROOM_ID),
          };
        },
        findById: (roomId: string) => {
          assert.equal(roomId, ROOM_ID);

          return createPopulatedExecChain(createRoomDocument());
        },
      } as unknown as Model<RoomDocument>,
      {
        exists: async (filters: unknown) => {
          assert.deepEqual(filters, {
            _id: ROOM_TYPE_ID,
            isActive: true,
          });

          return { _id: ROOM_TYPE_ID };
        },
      } as unknown as Model<RoomTypeDocument>,
    );

    await service.createRoom({
      roomNumber: "101",
      roomTypeId: ROOM_TYPE_ID,
    });

    assert.notEqual(createdPayload, null);

    const payload = createdPayload as unknown as Record<string, unknown>;

    assert.equal(payload.roomNumber, "101");
    assert.equal(payload.status, RoomStatus.Available);
    assert.ok(payload.roomType instanceof Types.ObjectId);
  });

  it("rejects rooms that reference a missing room type", async () => {
    const service = new RoomsService(
      {} as Model<RoomDocument>,
      {
        exists: async () => null,
      } as unknown as Model<RoomTypeDocument>,
    );

    await assert.rejects(
      () =>
        service.createRoom({
          roomNumber: "101",
          roomTypeId: ROOM_TYPE_ID,
        }),
      BadRequestException,
    );
  });

  it("updates room number and room type while validating references", async () => {
    let receivedUpdate: unknown;
    const service = new RoomsService(
      {
        findByIdAndUpdate: (
          _roomId: string,
          update: unknown,
          _options: unknown,
        ) => {
          receivedUpdate = update;

          return createPopulatedExecChain(
            createRoomDocument({ roomNumber: "102" }),
          );
        },
      } as unknown as Model<RoomDocument>,
      {
        exists: async () => ({ _id: ROOM_TYPE_ID }),
      } as unknown as Model<RoomTypeDocument>,
    );

    const room = await service.updateRoom(ROOM_ID, {
      roomNumber: "102",
      roomTypeId: ROOM_TYPE_ID,
    });

    const update = receivedUpdate as { $set: Record<string, unknown> };

    assert.equal(update.$set.roomNumber, "102");
    assert.ok(update.$set.roomType instanceof Types.ObjectId);
    assert.equal(room.roomNumber, "102");
  });

  it("rejects empty room updates", async () => {
    const service = new RoomsService(
      {} as Model<RoomDocument>,
      {} as Model<RoomTypeDocument>,
    );

    await assert.rejects(
      () => service.updateRoom(ROOM_ID, {}),
      BadRequestException,
    );
  });

  it("allows housekeeping to update cleaning-related statuses only", async () => {
    let receivedStatus: unknown;
    const service = new RoomsService(
      {
        findByIdAndUpdate: (
          _roomId: string,
          update: { $set: { status: RoomStatus } },
          _options: unknown,
        ) => {
          receivedStatus = update.$set.status;

          return createPopulatedExecChain(
            createRoomDocument({ status: update.$set.status }),
          );
        },
      } as unknown as Model<RoomDocument>,
      {} as Model<RoomTypeDocument>,
    );

    const room = await service.updateRoomStatus(
      ROOM_ID,
      RoomStatus.Cleaning,
      UserRole.Housekeeping,
    );

    assert.equal(receivedStatus, RoomStatus.Cleaning);
    assert.equal(room.status, RoomStatus.Cleaning);

    await assert.rejects(
      () =>
        service.updateRoomStatus(
          ROOM_ID,
          RoomStatus.Occupied,
          UserRole.Housekeeping,
        ),
      ForbiddenException,
    );
  });

  it("reports missing rooms as not found", async () => {
    const service = new RoomsService(
      {
        findById: () => createPopulatedExecChain(null),
      } as unknown as Model<RoomDocument>,
      {} as Model<RoomTypeDocument>,
    );

    await assert.rejects(
      () => service.getRoom(ROOM_ID),
      NotFoundException,
    );
  });
});
