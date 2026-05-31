import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Model } from "mongoose";
import { Types } from "mongoose";
import type { AvailabilityService } from "../../availability/services";
import type { PublicRoomTypeAvailability } from "../../availability/types";
import { ReservationStatus } from "../../common/enums";
import { HotelBusinessConflictException } from "../../common/errors";
import type { GuestDocument } from "../../guests/schemas";
import type { RoomTypeDocument } from "../../room-types/schemas/room-type.schema";
import { ReservationSource, type ReservationDocument } from "../schemas";
import { ReservationsService } from "./reservations.service";

const ROOM_TYPE_ID = "507f1f77bcf86cd799439011";
const GUEST_ID = "507f1f77bcf86cd799439012";
const RESERVATION_ID = "507f1f77bcf86cd799439013";
const FIXED_NOW = new Date("2026-05-31T12:00:00.000Z");
const EXPECTED_EXPIRES_AT = new Date("2026-06-01T12:00:00.000Z");

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

type GuestDocumentStub = Pick<
  GuestDocument,
  "_id" | "email" | "name" | "phone"
>;

type ReservationDocumentStub = Pick<
  ReservationDocument,
  | "_id"
  | "code"
  | "createdAt"
  | "currency"
  | "expiresAt"
  | "guestCount"
  | "status"
  | "totalAmount"
>;

function createExecChain<TValue>(value: TValue) {
  return {
    exec: async () => value,
  };
}

function createRoomTypeDocument(
  overrides: Partial<RoomTypeDocumentStub> = {},
): RoomTypeDocumentStub {
  return {
    _id: new Types.ObjectId(ROOM_TYPE_ID),
    name: "Standard",
    capacity: 2,
    amenities: ["Wi-Fi"],
    photoUrls: ["https://example.com/standard.jpg"],
    baseNightlyRate: 90000,
    isActive: true,
    ...overrides,
  };
}

function createGuestDocument(
  overrides: Partial<GuestDocumentStub> = {},
): GuestDocumentStub {
  return {
    _id: new Types.ObjectId(GUEST_ID),
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+541155551234",
    ...overrides,
  };
}

function createReservationDocument(
  overrides: Partial<ReservationDocumentStub> = {},
): ReservationDocumentStub {
  return {
    _id: new Types.ObjectId(RESERVATION_ID),
    code: undefined,
    status: ReservationStatus.PendingConfirmation,
    guestCount: 2,
    totalAmount: 180000,
    currency: "ARS",
    expiresAt: EXPECTED_EXPIRES_AT,
    createdAt: FIXED_NOW,
    ...overrides,
  };
}

function createAvailableRoomType(
  overrides: Partial<PublicRoomTypeAvailability> = {},
): PublicRoomTypeAvailability {
  return {
    id: ROOM_TYPE_ID,
    name: "Standard",
    capacity: 2,
    amenities: ["Wi-Fi"],
    photoUrls: ["https://example.com/standard.jpg"],
    baseNightlyRate: 90000,
    availableCount: 1,
    priceSummary: {
      currency: "ARS",
      nightlyRate: 90000,
      nights: 2,
      subtotal: 180000,
      taxesAndFeesIncluded: true,
      total: 180000,
    },
    depositRule: {
      amount: 90000,
      code: "FIRST_NIGHT_DEPOSIT",
      currency: "ARS",
      description: "A first-night deposit is required for booking.",
      type: "first_night",
    },
    cancellationPolicy: {
      code: "FREE_CANCELLATION_UNTIL_48H_BEFORE_CHECK_IN",
      description:
        "Free cancellation is available until 48 hours before check-in. Late cancellations and no-shows may retain the first-night deposit.",
      freeCancellationUntilHoursBeforeCheckIn: 48,
      lateCancellationPenalty: "first_night_deposit",
      noShowPenalty: "first_night_deposit",
    },
    ...overrides,
  };
}

describe("ReservationsService", () => {
  it("creates a public pending reservation after rechecking availability", async () => {
    const operations: string[] = [];
    const availabilityCalls: unknown[] = [];
    let createdGuestPayload: Record<string, unknown> | undefined;
    let createdReservationPayload: Record<string, unknown> | undefined;
    const availableRoomType = createAvailableRoomType();
    const service = new ReservationsService(
      {
        create: async (payload: Record<string, unknown>) => {
          operations.push("reservation:create");
          assert.equal(availabilityCalls.length, 1);
          createdReservationPayload = payload;

          return createReservationDocument({
            guestCount: Number(payload.guestCount),
            totalAmount: Number(payload.totalAmount),
            currency: String(payload.currency),
            expiresAt: payload.expiresAt as Date,
            createdAt: payload.createdAt as Date,
          });
        },
      } as unknown as Model<ReservationDocument>,
      {
        findOne: (filters: unknown) => {
          assert.deepEqual(filters, {
            $or: [{ email: "ada@example.com" }, { phone: "+541155551234" }],
          });

          return createExecChain(null);
        },
        create: async (payload: Record<string, unknown>) => {
          operations.push("guest:create");
          createdGuestPayload = payload;

          return createGuestDocument({
            name: String(payload.name),
            email: String(payload.email),
            phone: String(payload.phone),
          });
        },
      } as unknown as Model<GuestDocument>,
      {
        findOne: (filters: unknown) => {
          assert.deepEqual(filters, {
            _id: new Types.ObjectId(ROOM_TYPE_ID),
            isActive: true,
          });

          return createExecChain(createRoomTypeDocument());
        },
      } as unknown as Model<RoomTypeDocument>,
      {
        getPublicAvailability: async (query: unknown) => {
          operations.push("availability:check");
          availabilityCalls.push(query);

          return {
            checkIn: "2026-06-10",
            checkOut: "2026-06-12",
            currency: "ARS",
            guests: 2,
            nights: 2,
            roomTypes: [availableRoomType],
          };
        },
      } as unknown as AvailabilityService,
      () => FIXED_NOW,
    );

    const response = await service.createPublicReservation({
      roomTypeId: ROOM_TYPE_ID,
      checkInDate: "2026-06-10",
      checkOutDate: "2026-06-12",
      guestCount: 2,
      guest: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        phone: "+54 11 5555 1234",
      },
      notes: "Late arrival",
      policyAccepted: true,
    });

    assert.deepEqual(operations, [
      "availability:check",
      "guest:create",
      "reservation:create",
    ]);
    assert.deepEqual(availabilityCalls, [
      {
        checkIn: "2026-06-10",
        checkOut: "2026-06-12",
        guests: 2,
      },
    ]);
    assert.deepEqual(createdGuestPayload, {
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+541155551234",
    });
    assert.deepEqual(createdReservationPayload, {
      checkInDate: new Date("2026-06-10T00:00:00.000Z"),
      checkOutDate: new Date("2026-06-12T00:00:00.000Z"),
      guestCount: 2,
      guest: new Types.ObjectId(GUEST_ID),
      roomType: new Types.ObjectId(ROOM_TYPE_ID),
      status: ReservationStatus.PendingConfirmation,
      totalAmount: 180000,
      currency: "ARS",
      notes: "Late arrival",
      policyAccepted: true,
      policyAcceptedAt: FIXED_NOW,
      policyVersion: "public-booking-v1",
      source: ReservationSource.Public,
      expiresAt: EXPECTED_EXPIRES_AT,
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
    });
    assert.deepEqual(response, {
      id: RESERVATION_ID,
      reference: RESERVATION_ID,
      status: ReservationStatus.PendingConfirmation,
      source: ReservationSource.Public,
      checkInDate: "2026-06-10",
      checkOutDate: "2026-06-12",
      guestCount: 2,
      roomType: {
        id: ROOM_TYPE_ID,
        name: "Standard",
        capacity: 2,
        amenities: ["Wi-Fi"],
        photoUrls: ["https://example.com/standard.jpg"],
        baseNightlyRate: 90000,
      },
      guest: {
        id: GUEST_ID,
        name: "Ada Lovelace",
        email: "ada@example.com",
        phone: "+541155551234",
      },
      currency: "ARS",
      totalAmount: 180000,
      priceSummary: availableRoomType.priceSummary,
      depositRule: availableRoomType.depositRule,
      cancellationPolicy: availableRoomType.cancellationPolicy,
      expiresAt: "2026-06-01T12:00:00.000Z",
      createdAt: "2026-05-31T12:00:00.000Z",
    });
  });

  it("rejects public reservations when the room type has no availability", async () => {
    const service = new ReservationsService(
      {} as Model<ReservationDocument>,
      {} as Model<GuestDocument>,
      {
        findOne: () => createExecChain(createRoomTypeDocument()),
      } as unknown as Model<RoomTypeDocument>,
      {
        getPublicAvailability: async () => ({
          checkIn: "2026-06-10",
          checkOut: "2026-06-12",
          currency: "ARS",
          guests: 2,
          nights: 2,
          roomTypes: [createAvailableRoomType({ availableCount: 0 })],
        }),
      } as unknown as AvailabilityService,
      () => FIXED_NOW,
    );

    await assert.rejects(
      () =>
        service.createPublicReservation({
          roomTypeId: ROOM_TYPE_ID,
          checkInDate: "2026-06-10",
          checkOutDate: "2026-06-12",
          guestCount: 2,
          guest: {
            name: "Ada Lovelace",
            email: "ada@example.com",
            phone: "+541155551234",
          },
          policyAccepted: true,
        }),
      (error: unknown) => {
        assert.ok(error instanceof HotelBusinessConflictException);

        const response = error.getResponse() as { code: string };

        assert.equal(response.code, "ROOM_TYPE_NOT_AVAILABLE");

        return true;
      },
    );
  });

  it("rejects public reservations that exceed room type capacity", async () => {
    let availabilityCalled = false;
    const service = new ReservationsService(
      {} as Model<ReservationDocument>,
      {} as Model<GuestDocument>,
      {
        findOne: () =>
          createExecChain(
            createRoomTypeDocument({
              capacity: 2,
            }),
          ),
      } as unknown as Model<RoomTypeDocument>,
      {
        getPublicAvailability: async () => {
          availabilityCalled = true;

          throw new Error("Availability should not be checked");
        },
      } as unknown as AvailabilityService,
      () => FIXED_NOW,
    );

    await assert.rejects(
      () =>
        service.createPublicReservation({
          roomTypeId: ROOM_TYPE_ID,
          checkInDate: "2026-06-10",
          checkOutDate: "2026-06-12",
          guestCount: 3,
          guest: {
            name: "Ada Lovelace",
            email: "ada@example.com",
            phone: "+541155551234",
          },
          policyAccepted: true,
        }),
      (error: unknown) => {
        assert.ok(error instanceof HotelBusinessConflictException);

        const response = error.getResponse() as { code: string };

        assert.equal(response.code, "ROOM_TYPE_CAPACITY_EXCEEDED");

        return true;
      },
    );
    assert.equal(availabilityCalled, false);
  });
});
