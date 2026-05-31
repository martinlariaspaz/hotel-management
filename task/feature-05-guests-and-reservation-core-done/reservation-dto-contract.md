# Feature 5 Reservation DTO Contract

This document completes F5-I1 by defining the shared reservation and guest fields
that backend DTOs and UI payloads must use for public and internal flows.

## Status Values

Reservation status values are shared across backend and UI:

- `pending_confirmation`
- `confirmed`
- `checked_in`
- `checked_out`
- `cancelled`
- `no_show`

Feature 5 only defines the core contract. Later features add creation endpoints,
availability checks, assignment, check-in, check-out, payments, cancellation,
and no-show actions.

## Guest Fields

Guest records represent the primary guest attached to a reservation.

| Field | Type | Required | Public create | Internal create | Response | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | string | no | no | optional existing guest reference | yes | Mongo document id exposed as string. |
| `name` | string | yes | yes | yes | yes | Trimmed primary guest display name. |
| `email` | string | yes | yes | yes | yes | Lowercase, validated email. Used for confirmations. |
| `phone` | string | yes | yes | yes | yes | Validated phone contact. |
| `notes` | string | no | yes | yes | yes | Optional guest-level notes. |
| `createdAt` | ISO string | no | no | no | yes | Server generated. |
| `updatedAt` | ISO string | no | no | no | yes | Server generated. |

Duplicate guest handling must be explicit. The MVP may reuse or reject duplicate
email/phone records, but the backend must not silently create ambiguous duplicate
guest identities.

## Reservation Fields

| Field | Type | Required | Public create | Internal create | Response | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | string | no | no | no | yes | Mongo document id exposed as string. |
| `guestId` | string | conditional | no | optional | no | Used when internal staff links an existing guest. |
| `guest` | guest object or summary | yes | nested guest input | nested or existing guest | yes | Primary guest for the reservation. |
| `roomTypeId` | string | yes | yes | yes | no | Room type being booked. Public guests book room types, not room numbers. |
| `roomType` | room type summary | no | no | no | yes | Summary includes `id`, `name`, `capacity`, and active/rate fields when available. |
| `roomId` | string | no | no | optional | no | Staff-only physical room assignment in later flows. |
| `room` | room summary | no | no | no | yes | Optional assigned room summary for staff views. |
| `checkInDate` | `YYYY-MM-DD` or ISO string | yes | yes | yes | yes | Check-in date. |
| `checkOutDate` | `YYYY-MM-DD` or ISO string | yes | yes | yes | yes | Must be after check-in date. |
| `guestCount` | number | yes | yes | yes | yes | Must be at least 1 and within room type capacity when availability exists. |
| `status` | reservation status | conditional | server default | optional valid starting status | yes | Public starts as `pending_confirmation`; staff flow may choose an allowed starting status. |
| `source` | `public` or `staff` | yes | server/public value | server/staff value | yes | Identifies booking origin. |
| `totalAmount` | number | yes | server calculated later | staff/server calculated later | yes | Reservation total in MVP currency. |
| `currency` | string | yes | server default | server default | yes | Use `ARS` for MVP unless a later pricing feature changes it. |
| `code` | string | no | no | no | yes after generation | Guest-visible confirmation code. Only generated when the reservation is confirmed. |
| `notes` | string | no | yes | yes | yes | Reservation-level notes or requests. |
| `policyAccepted` | boolean | yes for public | yes | optional for staff | yes | Public booking must accept policy before submission. |
| `policyAcceptedAt` | ISO string | conditional | server generated when accepted | optional/server generated | yes | Records policy acceptance timing. |
| `expiresAt` | ISO string | conditional | server generated for pending public reservations | optional | yes | Public pending reservations expire after 24 hours. |
| `createdAt` | ISO string | no | no | no | yes | Server generated. |
| `updatedAt` | ISO string | no | no | no | yes | Server generated. |

## Public Flow Payload

Public booking creation in Feature 7 should submit:

- `roomTypeId`
- `checkInDate`
- `checkOutDate`
- `guestCount`
- nested `guest` fields
- `notes`, optional
- `policyAccepted`, required and true

The backend must set `source = public`, `status = pending_confirmation`,
and `expiresAt = createdAt + 24 hours` after rechecking availability.

## Internal Flow Payload

Staff reservation creation in Feature 8 should submit:

- either `guestId` or nested `guest` fields
- `roomTypeId`
- `roomId`, optional when assignment is known
- `checkInDate`
- `checkOutDate`
- `guestCount`
- `status`, optional allowed starting status
- `notes`, optional
- pricing totals when staff pricing flow exists

The backend must set `source = staff` and reject invalid status transitions with
hotel-business conflict codes that the UI can localize.

## Response Shape

Reservation responses should expose string ids and summary objects instead of raw
Mongo ObjectIds. UI domain types should mirror this response shape exactly:

- `guest` uses guest response fields.
- `roomType` uses a room type summary.
- `room` is optional and only present when assigned and allowed for the current view.
- date/time values are serialized strings.
- status, source, currency, totals, policy, code, expiration, and timestamps are explicit.
