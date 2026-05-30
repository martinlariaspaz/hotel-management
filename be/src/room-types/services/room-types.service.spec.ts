import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { Model } from "mongoose";
import {
  REALTIME_EVENT_NAMES,
  type RealtimeGateway,
} from "../../realtime/realtime.gateway";
import { RoomTypesService } from "./room-types.service";
import type { RoomTypeDocument } from "../schemas/room-type.schema";

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

type EmittedRealtimeEvent = {
  event: string;
  payload: {
    action: string;
    entity: string;
    id: string;
  };
};

function createRealtimeGatewayStub(
  events: EmittedRealtimeEvent[],
): RealtimeGateway {
  return {
    emitMutationEvent: (
      event: string,
      payload: EmittedRealtimeEvent["payload"],
    ) => events.push({ event, payload }),
  } as unknown as RealtimeGateway;
}

function createDocument(
  overrides: Partial<RoomTypeDocumentStub> = {},
): RoomTypeDocumentStub {
  return {
    _id: {
      toString: () => "507f1f77bcf86cd799439011",
    } as RoomTypeDocument["_id"],
    name: "Suite",
    capacity: 2,
    amenities: ["Wi-Fi", "Breakfast"],
    photoUrls: ["https://example.com/suite.jpg"],
    baseNightlyRate: 120000,
    isActive: true,
    ...overrides,
  };
}

describe("RoomTypesService", () => {
  it("lists only public-safe active room type fields", async () => {
    const service = new RoomTypesService({
      find: (filters: unknown) => {
        assert.deepEqual(filters, { isActive: true });

        return {
          sort: () => ({
            exec: async () => [createDocument()],
          }),
        };
      },
    } as unknown as Model<RoomTypeDocument>);

    const roomTypes = await service.listPublicRoomTypes();

    assert.deepEqual(roomTypes, [
      {
        id: "507f1f77bcf86cd799439011",
        name: "Suite",
        capacity: 2,
        amenities: ["Wi-Fi", "Breakfast"],
        photoUrls: ["https://example.com/suite.jpg"],
        baseNightlyRate: 120000,
      },
    ]);
  });

  it("lists admin room types with active state", async () => {
    const service = new RoomTypesService({
      find: (filters: unknown) => {
        assert.deepEqual(filters, {});

        return {
          sort: () => ({
            exec: async () => [createDocument({ isActive: false })],
          }),
        };
      },
    } as unknown as Model<RoomTypeDocument>);

    const roomTypes = await service.listAdminRoomTypes();

    assert.equal(roomTypes[0].isActive, false);
  });

  it("creates room types with default active state and normalized empty arrays", async () => {
    let createdPayload: Record<string, unknown> | null = null;
    const emittedEvents: EmittedRealtimeEvent[] = [];
    const service = new RoomTypesService(
      {
        create: async (payload: Record<string, unknown>) => {
          createdPayload = payload;

          return createDocument({
            name: String(payload.name),
            capacity: Number(payload.capacity),
            amenities: payload.amenities as string[],
            photoUrls: payload.photoUrls as string[],
            baseNightlyRate: Number(payload.baseNightlyRate),
            isActive: Boolean(payload.isActive),
          });
        },
      } as unknown as Model<RoomTypeDocument>,
      createRealtimeGatewayStub(emittedEvents),
    );

    const roomType = await service.createRoomType({
      name: "Standard",
      capacity: 2,
      baseNightlyRate: 90000,
    });
    const payload = createdPayload as unknown as Record<string, unknown>;

    assert.deepEqual(payload.amenities, []);
    assert.deepEqual(payload.photoUrls, []);
    assert.equal(payload.isActive, true);
    assert.equal(roomType.name, "Standard");
    assert.deepEqual(emittedEvents, [
      {
        event: REALTIME_EVENT_NAMES.RoomTypesChanged,
        payload: {
          action: "created",
          entity: "room-type",
          id: "507f1f77bcf86cd799439011",
        },
      },
    ]);
  });

  it("rejects duplicate room type names with a validation-safe bad request", async () => {
    const service = new RoomTypesService({
      create: async () => {
        throw { code: 11000 };
      },
    } as unknown as Model<RoomTypeDocument>);

    await assert.rejects(
      () =>
        service.createRoomType({
          name: "Suite",
          capacity: 2,
          baseNightlyRate: 120000,
        }),
      BadRequestException,
    );
  });

  it("updates editable room type fields", async () => {
    let receivedUpdate: unknown;
    const emittedEvents: EmittedRealtimeEvent[] = [];
    const service = new RoomTypesService(
      {
        findByIdAndUpdate: (
          _roomTypeId: string,
          update: unknown,
          _options: unknown,
        ) => {
          receivedUpdate = update;

          return {
            exec: async () =>
              createDocument({
                capacity: 4,
                baseNightlyRate: 180000,
              }),
          };
        },
      } as unknown as Model<RoomTypeDocument>,
      createRealtimeGatewayStub(emittedEvents),
    );

    const roomType = await service.updateRoomType("507f1f77bcf86cd799439011", {
      capacity: 4,
      baseNightlyRate: 180000,
    });

    assert.deepEqual(receivedUpdate, {
      $set: {
        capacity: 4,
        baseNightlyRate: 180000,
      },
    });
    assert.equal(roomType.capacity, 4);
    assert.deepEqual(emittedEvents, [
      {
        event: REALTIME_EVENT_NAMES.RoomTypesChanged,
        payload: {
          action: "updated",
          entity: "room-type",
          id: "507f1f77bcf86cd799439011",
        },
      },
    ]);
  });

  it("rejects empty room type updates", async () => {
    const service = new RoomTypesService({} as Model<RoomTypeDocument>);

    await assert.rejects(
      () => service.updateRoomType("507f1f77bcf86cd799439011", {}),
      BadRequestException,
    );
  });

  it("deactivates room types without hard deleting them", async () => {
    let receivedUpdate: unknown;
    const emittedEvents: EmittedRealtimeEvent[] = [];
    const service = new RoomTypesService(
      {
        findByIdAndUpdate: (
          _roomTypeId: string,
          update: unknown,
          _options: unknown,
        ) => {
          receivedUpdate = update;

          return {
            exec: async () => createDocument({ isActive: false }),
          };
        },
      } as unknown as Model<RoomTypeDocument>,
      createRealtimeGatewayStub(emittedEvents),
    );

    const roomType = await service.deactivateRoomType(
      "507f1f77bcf86cd799439011",
    );

    assert.deepEqual(receivedUpdate, {
      $set: {
        isActive: false,
      },
    });
    assert.equal(roomType.isActive, false);
    assert.deepEqual(emittedEvents, [
      {
        event: REALTIME_EVENT_NAMES.RoomTypesChanged,
        payload: {
          action: "deactivated",
          entity: "room-type",
          id: "507f1f77bcf86cd799439011",
        },
      },
    ]);
  });

  it("reports missing room types as not found", async () => {
    const service = new RoomTypesService({
      findOne: () => ({
        exec: async () => null,
      }),
    } as unknown as Model<RoomTypeDocument>);

    await assert.rejects(
      () => service.getPublicRoomType("507f1f77bcf86cd799439011"),
      NotFoundException,
    );
  });
});
