import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ForbiddenException, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import { UserRole } from "../types/user-role.type";

function createContext(role?: UserRole): ExecutionContext {
  return {
    getClass: () => class TestController {},
    getHandler: () => () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({
        auth: role
          ? {
              user: {
                id: "user-id",
                username: "staff",
                role,
              },
            }
          : undefined,
      }),
    }),
  } as unknown as ExecutionContext;
}

function createGuard(requiredRoles: readonly UserRole[]): RolesGuard {
  const reflector = {
    getAllAndOverride: () => requiredRoles,
  } as unknown as Reflector;

  return new RolesGuard(reflector);
}

describe("RolesGuard", () => {
  it("allows a request when no role metadata is required", () => {
    const guard = createGuard([]);

    assert.equal(guard.canActivate(createContext(UserRole.Reception)), true);
  });

  it("allows a request with a matching authenticated role", () => {
    const guard = createGuard([UserRole.Admin]);

    assert.equal(guard.canActivate(createContext(UserRole.Admin)), true);
  });

  it("denies a request with a mismatched authenticated role", () => {
    const guard = createGuard([UserRole.Admin]);

    assert.throws(
      () => guard.canActivate(createContext(UserRole.Housekeeping)),
      ForbiddenException,
    );
  });
});
