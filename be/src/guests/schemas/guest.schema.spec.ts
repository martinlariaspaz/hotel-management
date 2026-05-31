import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { model } from "mongoose";
import { Guest, GuestSchema } from "./guest.schema";

const GuestSchemaSpecModel = model<Guest>(
  "GuestSchemaSpecGuest",
  GuestSchema,
);

describe("GuestSchema", () => {
  it("normalizes email, phone, and optional notes", async () => {
    const guest = new GuestSchemaSpecModel({
      name: " Ada Lovelace ",
      email: " ADA@example.COM ",
      phone: " +54 (11) 5555-1234 ",
      notes: "  Prefers quiet rooms  ",
    });

    await guest.validate();

    assert.equal(guest.name, "Ada Lovelace");
    assert.equal(guest.email, "ada@example.com");
    assert.equal(guest.phone, "+541155551234");
    assert.equal(guest.notes, "Prefers quiet rooms");
  });

  it("rejects invalid email and phone values", async () => {
    const guest = new GuestSchemaSpecModel({
      name: "Ada Lovelace",
      email: "not-an-email",
      phone: "hotel-front-desk",
    });

    await assert.rejects(() => guest.validate(), /Guest email must be valid/);
  });

  it("declares explicit unique indexes for duplicate guest contacts", () => {
    const indexes = GuestSchema.indexes();

    assert.ok(
      indexes.some(
        ([fields, options]) =>
          fields.email === 1 &&
          options?.unique === true &&
          options.name === "unique_guest_email",
      ),
    );
    assert.ok(
      indexes.some(
        ([fields, options]) =>
          fields.phone === 1 &&
          options?.unique === true &&
          options.name === "unique_guest_phone",
      ),
    );
  });
});
