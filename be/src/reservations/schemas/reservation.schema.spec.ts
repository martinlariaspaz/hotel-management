import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { model, Types } from "mongoose";
import { ReservationStatus } from "../../common/enums";
import {
  Reservation,
  ReservationSchema,
  ReservationSource,
} from "./reservation.schema";

const ReservationSchemaSpecModel = model<Reservation>(
  "ReservationSchemaSpecReservation",
  ReservationSchema,
);

function createReservationPayload(overrides: Partial<Reservation> = {}) {
  return {
    checkInDate: new Date("2026-06-01T00:00:00.000Z"),
    checkOutDate: new Date("2026-06-03T00:00:00.000Z"),
    guestCount: 2,
    guest: new Types.ObjectId(),
    roomType: new Types.ObjectId(),
    totalAmount: 240000,
    policyAccepted: true,
    policyAcceptedAt: new Date("2026-05-31T12:00:00.000Z"),
    ...overrides,
  };
}

describe("ReservationSchema", () => {
  it("defaults public reservations to pending confirmation", async () => {
    const reservation = new ReservationSchemaSpecModel(
      createReservationPayload(),
    );

    await reservation.validate();

    assert.equal(reservation.status, ReservationStatus.PendingConfirmation);
    assert.equal(reservation.source, ReservationSource.Public);
    assert.equal(reservation.currency, "ARS");
    assert.equal(reservation.code, undefined);
  });

  it("normalizes guest-visible reservation codes when present", async () => {
    const reservation = new ReservationSchemaSpecModel(
      createReservationPayload({
        code: " rsv-abc23456 ",
      }),
    );

    await reservation.validate();

    assert.equal(reservation.code, "RSV-ABC23456");
  });

  it("allows staff-created reservations to persist a selected valid status", async () => {
    const reservation = new ReservationSchemaSpecModel(
      createReservationPayload({
        source: ReservationSource.Staff,
        status: ReservationStatus.Confirmed,
      }),
    );

    await reservation.validate();

    assert.equal(reservation.source, ReservationSource.Staff);
    assert.equal(reservation.status, ReservationStatus.Confirmed);
  });

  it("rejects invalid reservation date ranges", async () => {
    const reservation = new ReservationSchemaSpecModel(
      createReservationPayload({
        checkOutDate: new Date("2026-06-01T00:00:00.000Z"),
      }),
    );

    await assert.rejects(
      () => reservation.validate(),
      /Reservation check-out date must be after check-in date/,
    );
  });

  it("rejects negative reservation totals", async () => {
    const reservation = new ReservationSchemaSpecModel(
      createReservationPayload({
        totalAmount: -1,
      }),
    );

    await assert.rejects(() => reservation.validate(), /Path `totalAmount`/);
  });

  it("declares a unique guest-visible reservation code index", () => {
    const indexes = ReservationSchema.indexes();

    assert.ok(
      indexes.some(
        ([fields, options]) =>
          fields.code === 1 &&
          options?.unique === true &&
          options.sparse === true &&
          options.name === "unique_reservation_code",
      ),
    );
  });
});
