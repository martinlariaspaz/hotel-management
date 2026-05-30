import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HealthService } from "./health.service";

describe("HealthService", () => {
  it("returns an ok health check with an ISO timestamp", () => {
    const service = new HealthService();
    const result = service.getHealth();

    assert.equal(result.status, "ok");
    assert.doesNotThrow(() => new Date(result.timestamp).toISOString());
  });
});
