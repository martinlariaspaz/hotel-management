import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HotelBusinessConflictException } from "../../common/errors";
import {
  RESERVATION_CODE_GENERATION_EXHAUSTED_CODE,
  generateReservationCode,
  generateUniqueReservationCode,
} from "./reservation-code-generator";

describe("reservation code generator", () => {
  it("generates guest-safe uppercase codes without ambiguous characters", () => {
    const code = generateReservationCode({
      randomBytes: () => Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7]),
    });

    assert.equal(code, "RSV-23456789");
    assert.match(code, /^RSV-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/);
  });

  it("retries until the generated reservation code is available", async () => {
    const generatedCodes: string[] = [];
    const byteSets = [
      new Uint8Array(8).fill(0),
      new Uint8Array(8).fill(1),
    ];
    let byteSetIndex = 0;

    const code = await generateUniqueReservationCode({
      randomBytes: () => byteSets[byteSetIndex++],
      maxAttempts: 2,
      isCodeAvailable: async (candidateCode) => {
        generatedCodes.push(candidateCode);

        return candidateCode !== "RSV-22222222";
      },
    });

    assert.equal(code, "RSV-33333333");
    assert.deepEqual(generatedCodes, ["RSV-22222222", "RSV-33333333"]);
  });

  it("throws a business conflict when uniqueness attempts are exhausted", async () => {
    await assert.rejects(
      () =>
        generateUniqueReservationCode({
          randomBytes: () => new Uint8Array(8).fill(0),
          maxAttempts: 2,
          isCodeAvailable: async () => false,
        }),
      (error: unknown) => {
        assert.ok(error instanceof HotelBusinessConflictException);

        const response = error.getResponse() as { code: string };

        assert.equal(response.code, RESERVATION_CODE_GENERATION_EXHAUSTED_CODE);

        return true;
      },
    );
  });
});
