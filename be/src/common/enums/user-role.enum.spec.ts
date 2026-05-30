import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { USER_ROLE_VALUES, UserRole } from "./user-role.enum";

describe("UserRole", () => {
  it("matches the MVP staff role contract", () => {
    assert.deepEqual(USER_ROLE_VALUES, [
      UserRole.Admin,
      UserRole.Reception,
      UserRole.Housekeeping,
      UserRole.Management,
    ]);
  });
});
