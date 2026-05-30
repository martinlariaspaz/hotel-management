import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BadRequestException } from "@nestjs/common";
import { Types, type Model } from "mongoose";
import type { AuthenticatedUser } from "../../auth/types/auth.types";
import type { UserDocument } from "../../auth/schemas/user.schema";
import {
  MaintenanceBlockStatus,
  RoomStatus,
  UserRole,
} from "../../common/enums";
import { HotelBusinessConflictException } from "../../common/errors";
import {
  REALTIME_EVENT_NAMES,
  type RealtimeGateway,
} from "../../realtime/realtime.gateway";
import type { RoomDocument } from "../../rooms/schemas";
import type { MaintenanceBlockDocument } from "../schemas";
import { MaintenanceBlocksService } from "./maintenance-blocks.service";

const ROOM_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439012";
const BLOCK_ID = "507f1f77bcf86cd799439013";

type RoomDocumentStub = Pick<
  RoomDocument,
  "_id" | "roomNumber" | "status"
>;

type UserDocumentStub = Pick<UserDocument, "_id" | "role" | "username">;

type MaintenanceBlockDocumentStub = Pick<
  MaintenanceBlockDocument,
  | "_id"
  | "cancelledAt"
  | "createdAt"
  | "endDate"
  | "reason"
  | "startDate"
  | "status"
  | "updatedAt"
> & {
  cancelledBy?: UserDocumentStub;
  createdBy: UserDocumentStub;
  room: RoomDocumentStub;
};

type EmittedRealtimeEvent = {
  event: string;
  payload: {
    action: string;
    entity: string;
    id: string;
  };
};

const actor: AuthenticatedUser = {
  id: USER_ID,
  username: "front-desk",
  role: UserRole.Reception,
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

function createExecChain<TValue>(value: TValue) {
  return {
    exec: async () => value,
  };
}

function createQueryChain<TValue>(value: TValue) {
  const chain = {
    exec: async () => value,
    populate: () => chain,
    sort: () => chain,
  };

  return chain;
}

function createRoomDocument(
  overrides: Partial<RoomDocumentStub> = {},
): RoomDocumentStub {
  return {
    _id: new Types.ObjectId(ROOM_ID),
    roomNumber: "101",
    status: RoomStatus.Available,
    ...overrides,
  };
}

function createUserDocument(
  overrides: Partial<UserDocumentStub> = {},
): UserDocumentStub {
  return {
    _id: new Types.ObjectId(USER_ID),
    username: "front-desk",
    role: UserRole.Reception,
    ...overrides,
  };
}

function createMaintenanceBlockDocument(
  overrides: Partial<MaintenanceBlockDocumentStub> = {},
): MaintenanceBlockDocumentStub {
  return {
    _id: new Types.ObjectId(BLOCK_ID),
    room: createRoomDocument(),
    startDate: new Date("2026-06-01T00:00:00.000Z"),
    endDate: new Date("2026-06-03T00:00:00.000Z"),
    reason: "Pipe repair",
    status: MaintenanceBlockStatus.Active,
    createdBy: createUserDocument(),
    createdAt: new Date("2026-05-30T12:00:00.000Z"),
    updatedAt: new Date("2026-05-30T12:00:00.000Z"),
    ...overrides,
  };
}

describe("MaintenanceBlocksService", () => {
  it("creates active maintenance blocks after validating room and overlaps", async () => {
    let createdPayload: Record<string, unknown> | null = null;
    let overlapFilters: unknown;
    const emittedEvents: EmittedRealtimeEvent[] = [];
    const service = new MaintenanceBlocksService(
      {
        create: async (payload: Record<string, unknown>) => {
          createdPayload = payload;

          return {
            _id: new Types.ObjectId(BLOCK_ID),
            startDate: payload.startDate,
            endDate: payload.endDate,
            reason: payload.reason,
            status: payload.status,
            createdAt: new Date("2026-05-30T12:00:00.000Z"),
            updatedAt: new Date("2026-05-30T12:00:00.000Z"),
          };
        },
        exists: async (filters: unknown) => {
          overlapFilters = filters;

          return null;
        },
      } as unknown as Model<MaintenanceBlockDocument>,
      {
        findById: (roomId: string) => {
          assert.equal(roomId, ROOM_ID);

          return createExecChain(createRoomDocument());
        },
      } as unknown as Model<RoomDocument>,
      createRealtimeGatewayStub(emittedEvents),
    );

    const maintenanceBlock = await service.createMaintenanceBlock(
      {
        roomId: ROOM_ID,
        startDate: "2026-06-01",
        endDate: "2026-06-03",
        reason: "Pipe repair",
      },
      actor,
    );

    assert.notEqual(createdPayload, null);
    assert.notEqual(overlapFilters, null);

    const payload = createdPayload as unknown as Record<string, unknown>;

    assert.ok(payload.room instanceof Types.ObjectId);
    assert.ok(payload.createdBy instanceof Types.ObjectId);
    assert.equal(payload.status, MaintenanceBlockStatus.Active);
    assert.equal(maintenanceBlock.id, BLOCK_ID);
    assert.equal(maintenanceBlock.startDate, "2026-06-01");
    assert.equal(maintenanceBlock.endDate, "2026-06-03");
    assert.equal(maintenanceBlock.createdBy.username, "front-desk");
    assert.deepEqual(emittedEvents, [
      {
        event: REALTIME_EVENT_NAMES.MaintenanceBlocksChanged,
        payload: {
          action: "created",
          entity: "maintenance-block",
          id: BLOCK_ID,
        },
      },
    ]);
  });

  it("rejects invalid maintenance date ranges", async () => {
    const service = new MaintenanceBlocksService(
      {} as Model<MaintenanceBlockDocument>,
      {} as Model<RoomDocument>,
    );

    await assert.rejects(
      () =>
        service.createMaintenanceBlock(
          {
            roomId: ROOM_ID,
            startDate: "2026-06-03",
            endDate: "2026-06-03",
            reason: "Pipe repair",
          },
          actor,
        ),
      BadRequestException,
    );
  });

  it("rejects maintenance blocks for unavailable room statuses", async () => {
    const service = new MaintenanceBlocksService(
      {
        exists: async () => null,
      } as unknown as Model<MaintenanceBlockDocument>,
      {
        findById: () =>
          createExecChain(
            createRoomDocument({ status: RoomStatus.Occupied }),
          ),
      } as unknown as Model<RoomDocument>,
    );

    await assert.rejects(
      () =>
        service.createMaintenanceBlock(
          {
            roomId: ROOM_ID,
            startDate: "2026-06-01",
            endDate: "2026-06-03",
            reason: "Pipe repair",
          },
          actor,
        ),
      HotelBusinessConflictException,
    );
  });

  it("rejects overlapping active maintenance blocks", async () => {
    const service = new MaintenanceBlocksService(
      {
        exists: async () => ({ _id: BLOCK_ID }),
      } as unknown as Model<MaintenanceBlockDocument>,
      {
        findById: () => createExecChain(createRoomDocument()),
      } as unknown as Model<RoomDocument>,
    );

    await assert.rejects(
      () =>
        service.createMaintenanceBlock(
          {
            roomId: ROOM_ID,
            startDate: "2026-06-01",
            endDate: "2026-06-03",
            reason: "Pipe repair",
          },
          actor,
        ),
      HotelBusinessConflictException,
    );
  });

  it("lists maintenance blocks by room, date range, and status", async () => {
    let receivedFilters: unknown;
    const service = new MaintenanceBlocksService(
      {
        find: (filters: unknown) => {
          receivedFilters = filters;

          return createQueryChain([createMaintenanceBlockDocument()]);
        },
      } as unknown as Model<MaintenanceBlockDocument>,
      {} as Model<RoomDocument>,
    );

    const maintenanceBlocks = await service.listMaintenanceBlocks({
      roomId: ROOM_ID,
      startDate: "2026-06-01",
      endDate: "2026-06-10",
      status: MaintenanceBlockStatus.Active,
    });

    const filters = receivedFilters as {
      endDate: { $gt: Date };
      room: Types.ObjectId;
      startDate: { $lt: Date };
      status: MaintenanceBlockStatus;
    };

    assert.ok(filters.room instanceof Types.ObjectId);
    assert.equal(filters.status, MaintenanceBlockStatus.Active);
    assert.deepEqual(filters.startDate.$lt, new Date("2026-06-10T00:00:00.000Z"));
    assert.deepEqual(filters.endDate.$gt, new Date("2026-06-01T00:00:00.000Z"));
    assert.deepEqual(maintenanceBlocks, [
      {
        id: BLOCK_ID,
        room: {
          id: ROOM_ID,
          roomNumber: "101",
          status: RoomStatus.Available,
        },
        startDate: "2026-06-01",
        endDate: "2026-06-03",
        reason: "Pipe repair",
        status: MaintenanceBlockStatus.Active,
        createdBy: {
          id: USER_ID,
          username: "front-desk",
          role: UserRole.Reception,
        },
        createdAt: "2026-05-30T12:00:00.000Z",
        updatedAt: "2026-05-30T12:00:00.000Z",
      },
    ]);
  });

  it("cancels maintenance blocks without deleting them", async () => {
    let receivedUpdate: unknown;
    const emittedEvents: EmittedRealtimeEvent[] = [];
    const service = new MaintenanceBlocksService(
      {
        findById: (maintenanceBlockId: string) => {
          assert.equal(maintenanceBlockId, BLOCK_ID);

          return createExecChain(createMaintenanceBlockDocument());
        },
        findByIdAndUpdate: (
          maintenanceBlockId: string,
          update: unknown,
          _options: unknown,
        ) => {
          assert.equal(maintenanceBlockId, BLOCK_ID);
          receivedUpdate = update;

          return createQueryChain(
            createMaintenanceBlockDocument({
              status: MaintenanceBlockStatus.Cancelled,
              cancelledAt: new Date("2026-05-31T12:00:00.000Z"),
              cancelledBy: createUserDocument(),
              updatedAt: new Date("2026-05-31T12:00:00.000Z"),
            }),
          );
        },
      } as unknown as Model<MaintenanceBlockDocument>,
      {} as Model<RoomDocument>,
      createRealtimeGatewayStub(emittedEvents),
    );

    const maintenanceBlock = await service.cancelMaintenanceBlock(
      BLOCK_ID,
      actor,
    );

    const update = receivedUpdate as {
      $set: {
        cancelledAt: Date;
        cancelledBy: Types.ObjectId;
        status: MaintenanceBlockStatus;
      };
    };

    assert.equal(update.$set.status, MaintenanceBlockStatus.Cancelled);
    assert.ok(update.$set.cancelledAt instanceof Date);
    assert.ok(update.$set.cancelledBy instanceof Types.ObjectId);
    assert.equal(maintenanceBlock.status, MaintenanceBlockStatus.Cancelled);
    assert.equal(maintenanceBlock.cancelledAt, "2026-05-31T12:00:00.000Z");
    assert.deepEqual(emittedEvents, [
      {
        event: REALTIME_EVENT_NAMES.MaintenanceBlocksChanged,
        payload: {
          action: "cancelled",
          entity: "maintenance-block",
          id: BLOCK_ID,
        },
      },
    ]);
  });

  it("rejects cancellation for already cancelled blocks", async () => {
    const service = new MaintenanceBlocksService(
      {
        findById: () =>
          createExecChain(
            createMaintenanceBlockDocument({
              status: MaintenanceBlockStatus.Cancelled,
            }),
          ),
      } as unknown as Model<MaintenanceBlockDocument>,
      {} as Model<RoomDocument>,
    );

    await assert.rejects(
      () => service.cancelMaintenanceBlock(BLOCK_ID, actor),
      HotelBusinessConflictException,
    );
  });
});
