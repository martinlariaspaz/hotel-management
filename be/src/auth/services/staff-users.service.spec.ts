import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { Model } from "mongoose";
import { StaffUsersService } from "./staff-users.service";
import type { UserDocument } from "../schemas/user.schema";
import { UserRole } from "../types/user-role.type";

type StaffUserDocumentStub = Pick<
  UserDocument,
  "_id" | "isActive" | "role" | "username"
>;

function createDocument(
  overrides: Partial<StaffUserDocumentStub> = {},
): StaffUserDocumentStub {
  return {
    _id: {
      toString: () => "507f1f77bcf86cd799439011",
    } as UserDocument["_id"],
    username: "admin",
    role: UserRole.Admin,
    isActive: true,
    ...overrides,
  };
}

describe("StaffUsersService", () => {
  it("lists staff users without password fields", async () => {
    const service = new StaffUsersService({
      find: () => ({
        sort: () => ({
          exec: async () => [
            createDocument({
              username: "reception",
              role: UserRole.Reception,
            }),
          ],
        }),
      }),
    } as unknown as Model<UserDocument>);

    const users = await service.listStaffUsers();

    assert.deepEqual(users, [
      {
        id: "507f1f77bcf86cd799439011",
        username: "reception",
        role: UserRole.Reception,
        isActive: true,
      },
    ]);
  });

  it("creates a staff user with scrypt password storage", async () => {
    let createdPayload: Record<string, unknown> | null = null;
    const service = new StaffUsersService({
      create: async (payload: Record<string, unknown>) => {
        createdPayload = payload;

        return createDocument({
          username: String(payload.username),
          role: payload.role as UserRole,
          isActive: Boolean(payload.isActive),
        });
      },
    } as unknown as Model<UserDocument>);

    const user = await service.createStaffUser({
      username: "housekeeping",
      password: "password-123",
      role: UserRole.Housekeeping,
    });
    const payload = createdPayload as unknown as Record<string, unknown>;

    assert.equal(user.username, "housekeeping");
    assert.equal(payload.passwordAlgorithm, "scrypt");
    assert.notEqual(payload.passwordHash, "password-123");
    assert.equal(typeof payload.passwordSalt, "string");
  });

  it("rejects duplicate usernames with a validation-safe bad request", async () => {
    const service = new StaffUsersService({
      create: async () => {
        throw { code: 11000 };
      },
    } as unknown as Model<UserDocument>);

    await assert.rejects(
      () =>
        service.createStaffUser({
          username: "admin",
          password: "password-123",
          role: UserRole.Admin,
        }),
      BadRequestException,
    );
  });

  it("updates role and active state without hard deleting the user", async () => {
    let receivedUpdate: unknown;
    const service = new StaffUsersService({
      findByIdAndUpdate: (
        _userId: string,
        update: unknown,
        _options: unknown,
      ) => {
        receivedUpdate = update;

        return {
          exec: async () =>
            createDocument({
              role: UserRole.Management,
              isActive: false,
            }),
        };
      },
    } as unknown as Model<UserDocument>);

    const user = await service.updateStaffUser("507f1f77bcf86cd799439011", {
      role: UserRole.Management,
      isActive: false,
    });

    assert.deepEqual(receivedUpdate, {
      $set: {
        role: UserRole.Management,
        isActive: false,
      },
    });
    assert.equal(user.role, UserRole.Management);
    assert.equal(user.isActive, false);
  });

  it("rejects empty staff updates", async () => {
    const service = new StaffUsersService({} as Model<UserDocument>);

    await assert.rejects(
      () => service.updateStaffUser("507f1f77bcf86cd799439011", {}),
      BadRequestException,
    );
  });

  it("reports missing staff users as not found", async () => {
    const service = new StaffUsersService({
      findByIdAndUpdate: () => ({
        exec: async () => null,
      }),
    } as unknown as Model<UserDocument>);

    await assert.rejects(
      () =>
        service.updateStaffUser("507f1f77bcf86cd799439011", {
          isActive: false,
        }),
      NotFoundException,
    );
  });
});
