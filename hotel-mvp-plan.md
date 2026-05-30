# Hotel Management MVP Plan

## Orchestration Source

This plan was produced from a discussion between:

- Orchestrator: coordinates repo context, agent inputs, and final documentation.
- Hotel Domain Agent: owns hotel business decisions and operational rules.
- System Execution Planner Agent: decomposes the MVP into small execution tasks.

The hotel-domain decisions are the business source of truth. Technical tasks must not override those decisions without another domain review.

## Current Repo Context

- Backend lives in `be/` and uses NestJS, MongoDB, Mongoose, JWT auth, mail, and Socket.IO.
- Backend currently has `AuthModule`, `DatabaseModule`, `HealthModule`, `MailModule`, and `RealtimeModule`.
- Existing backend auth roles are `admin`, `owner`, and `employee`; the MVP replaces these with domain roles.
- UI lives in `ui/` and uses React, Vite, TypeScript, Mantine, React Query, React Hook Form, React Router, Zustand, Lucide React, and i18n.
- UI currently has login, a basic dashboard, health status, repository injection, English and Argentine Spanish translations, and dark mode support.
- All future UI work must follow `CODEX.md`: feature-based folders, i18n for all visible text, repository injection, and tests for business rules.

## MVP Scope

### In Scope

- Public booking website with date search, guest count, room type availability, room type details, policy display, booking form, and pending booking confirmation.
- Internal staff dashboard for reservations, guests, rooms, room status, payments, check-in, check-out, housekeeping, maintenance blocks, and basic reports.
- Staff-created reservations.
- Public guest-created pending reservations.
- Manual payment tracking.
- Cancellation, no-show, refund-due, and refunded tracking.
- Audit history for important operational actions.
- Email confirmation when staff confirms a pending public reservation.
- Real-time updates for operational changes.

### Out Of Scope

- OTA or channel manager integrations.
- Dynamic revenue management.
- Multi-property support.
- Group or event bookings.
- Loyalty program.
- Full accounting, legal invoicing, or tax system.
- Automated refunds or payment gateway processing.
- Advanced promotions, packages, or coupons.
- Guest self-service modification portal.

## Final Hotel Domain Decisions

- The MVP manages one hotel property.
- Inventory is managed by physical rooms.
- Rooms belong to room types.
- Public guests book room types, not room numbers.
- Staff assigns physical rooms internally.
- Rates are nightly and attached to room types.
- Taxes and fees are shown as included in the MVP final price unless configured later.
- Default deposit is the first night.
- MVP currency is ARS, displayed with the currency code, for example `ARS 120.000`.
- Public `pending_confirmation` reservations expire after 24 hours if staff does not confirm them.
- Default no-show cutoff is 11:59 PM on the check-in date.
- Housekeeping uses both room cleaning status and simple housekeeping task records.
- Confirmed reservation codes are shown on screen and sent by email.
- Check-in requires an assigned room that is available and clean/ready. Dirty or cleaning rooms cannot be checked in.

## Core Domain Entities

- `RoomType`
- `Room`
- `Guest`
- `Reservation`
- `ReservationGuest`
- `Payment`
- `HousekeepingTask`
- `MaintenanceBlock`
- `User`
- `AuditLog`

## Core Statuses

### Reservation Status

- `pending_confirmation`
- `confirmed`
- `checked_in`
- `checked_out`
- `cancelled`
- `no_show`

### Room Status

- `available`
- `reserved`
- `occupied`
- `cleaning`
- `dirty`
- `maintenance`
- `out_of_service`

### Payment Status

- `unpaid`
- `deposit_paid`
- `partially_paid`
- `paid`
- `refund_due`
- `refunded`

### User Roles

- `admin`: full access, user management, configuration, room and rate setup.
- `reception`: reservations, room assignment, check-in, check-out, payments, cancellations, no-shows.
- `housekeeping`: room/task visibility, cleaning status updates, maintenance issue reporting.
- `management`: reports, reservations, payments, occupancy, and exceptional review visibility.

## Global Implementation Rules

- Availability must always be validated server-side.
- Public availability must never expose rooms in maintenance, out of service, or internal blocks.
- Date changes and stay extensions must re-check availability.
- Assigned room changes must reject conflicts, occupied rooms, maintenance rooms, out-of-service rooms, and incompatible room types.
- Back-to-back stays are allowed, but the room must pass through dirty or cleaning before it is ready for the next guest.
- Do not delete reservations with payment history. Cancel or mark no-show instead.
- Balance must be derived from reservation total minus payments/refunds, not stored as the source of truth.
- Check-in is blocked for cancelled and no-show reservations.
- Check-out is blocked unless the reservation is checked in.
- Every payment change, cancellation, no-show, date change, room assignment, check-in, and check-out must become auditable.
- All user-facing UI copy must use i18n in English and Argentine Spanish.

## Milestones

1. M0 Foundation: statuses, MVP roles, test setup, API error contract, app shell.
2. M1 Inventory: room types, rooms, maintenance blocks.
3. M2 Booking Core: guests, reservations, availability, public pending bookings.
4. M3 Operations: staff reservations, room assignment, check-in, check-out, housekeeping.
5. M4 Money And Exceptions: manual payments, cancellations, no-shows, refund tracking.
6. M5 Visibility: audit log, reports, realtime updates.
7. M6 Polish: responsive QA, i18n QA, seed/demo data, and design alignment.

## Feature 0: Foundation

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F0-B1 | Add shared backend enums for reservation status, room status, payment status, and MVP user roles. | None | Enums exactly match this plan. Existing `owner` and `employee` roles are not silently reused. |
| F0-B2 | Add backend unit test command and minimal service test setup. | None | A backend test script exists. `npm --prefix be run typecheck` passes. |
| F0-B3 | Define common API error shape for validation, auth, and business conflict responses. | F0-B1 | Backend errors can identify validation errors, unauthorized errors, forbidden errors, and hotel-business conflicts. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F0-F1 | Add UI test setup for files under `features/*/business`. | None | One sample business test runs. No production component imports test-only code. |
| F0-F2 | Create authenticated app shell with responsive navigation placeholders. | Existing login/dashboard | Shell uses Mantine, i18n, dark mode tokens, and role-aware nav slots. |
| F0-F3 | Add shared UI status label/color helpers for reservation, room, and payment statuses. | F0-F1 | Helpers are typed, tested if business logic exists, and all labels come from i18n. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F0-I1 | Align backend error shape with UI repository error mapping. | F0-B3 | UI can show localized validation and business conflict messages consistently. |

## Feature 1: Roles And Permissions

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F1-B1 | Replace auth role type with `admin`, `reception`, `housekeeping`, and `management`. | F0-B1 | Login JWT returns the MVP role. Existing users require explicit migration or seed handling. |
| F1-B2 | Add role guard and role decorator for controller methods. | F1-B1 | Protected endpoints allow and deny requests according to role. |
| F1-B3 | Add admin-only staff user list endpoint. | F1-B2 | Admin can list staff users. Non-admin roles receive forbidden response. |
| F1-B4 | Add admin-only staff user create endpoint. | F1-B2 | Admin can create staff users with one MVP role. Password handling follows current auth hashing approach. |
| F1-B5 | Add admin-only staff user role/status update endpoint. | F1-B2 | Admin can update role and active state. Users are not hard-deleted. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F1-F1 | Update `AuthUser` and auth store for MVP roles. | F1-B1 | UI compiles and role is available to route and navigation logic. |
| F1-F2 | Add role-protected route wrapper. | F1-F1 | Unauthorized roles see a localized access-denied state. |
| F1-F3 | Add staff management repository, hooks, and query keys. | F1-B3 | Hooks consume repository context and do not import concrete HTTP modules in components. |
| F1-F4 | Add admin staff user list and create/update forms. | F1-F3 | Forms are typed, metadata-driven, localized, and responsive. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F1-I1 | Verify login, logout, protected route, and role mismatch flows. | F1-B2, F1-F2 | Backend and UI agree on role names and 401/403 behavior. |

## Feature 2: Room Types

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F2-B1 | Create `RoomType` schema with name, capacity, amenities, photo URLs, base nightly rate, and active flag. | F0-B1 | Required fields validate. Capacity and rate must be positive. |
| F2-B2 | Add admin room type create endpoint. | F2-B1, F1-B2 | Admin can create room types. Other roles are denied. |
| F2-B3 | Add room type list/detail endpoints. | F2-B1 | Public and staff-safe list responses do not expose internal-only fields. |
| F2-B4 | Add room type update endpoint. | F2-B1, F1-B2 | Admin can update editable fields. Invalid rate/capacity is rejected. |
| F2-B5 | Add room type deactivate endpoint. | F2-B1, F1-B2 | Room types are deactivated, not hard-deleted. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F2-F1 | Add room type domain types, repository contract, HTTP repository, and query keys. | F2-B3 | Hooks consume repository context. Query keys are stable. |
| F2-F2 | Add room type list section. | F2-F1 | Shows name, capacity, base rate, active state, loading, empty, and error states. |
| F2-F3 | Add metadata-driven room type form. | F2-F1 | React Hook Form is used. Labels/placeholders are localized. Submit payload is typed. |
| F2-F4 | Add room type deactivate action. | F2-F1 | Action has confirmation UI and invalidates list/detail queries. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F2-I1 | Wire room type CRUD and cache invalidation. | F2-B2, F2-B4, F2-B5, F2-F4 | Creating, updating, and deactivating a room type refreshes UI without page reload. |

## Feature 3: Rooms

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F3-B1 | Create `Room` schema with room number, room type, optional floor, optional notes, and room status. | F2-B1 | Room number is unique. Room type must exist. |
| F3-B2 | Add room create endpoint. | F3-B1, F1-B2 | Admin and reception can create rooms according to permissions. |
| F3-B3 | Add room list/detail endpoints. | F3-B1, F1-B2 | Staff can filter by status, room type, and floor. |
| F3-B4 | Add room update endpoint. | F3-B1, F1-B2 | Room type and room number updates validate uniqueness and references. |
| F3-B5 | Add room status update endpoint. | F3-B1, F1-B2 | Housekeeping can update cleaning-related statuses only. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F3-F1 | Add rooms repository, domain types, hooks, and query keys. | F3-B3 | Repository is replaceable and query keys are stable. |
| F3-F2 | Add room inventory list section. | F3-F1 | List shows room number, room type, floor, and status. |
| F3-F3 | Add room create/edit form. | F3-F1, F2-F1 | Form is typed, metadata-driven, localized, and responsive. |
| F3-F4 | Add room status board section. | F3-F1 | Rooms are grouped by status and room type with clear visual badges. |
| F3-F5 | Add role-aware room status controls. | F3-F1, F1-F2 | Housekeeping can only see allowed cleaning controls. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F3-I1 | Verify permissions on room status updates. | F3-B5, F3-F5 | Housekeeping cannot edit reservations, rates, or payments through room UI. |

## Feature 4: Maintenance Blocks

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F4-B1 | Create `MaintenanceBlock` schema with room, date range, reason, status, and createdBy. | F3-B1 | Date range validation rejects invalid ranges. |
| F4-B2 | Add create maintenance block endpoint. | F4-B1, F1-B2 | Admin and reception can block rooms. Maintenance cannot overlap invalid states without conflict handling. |
| F4-B3 | Add list maintenance blocks endpoint by room/date range. | F4-B1, F1-B2 | Staff can see blocks for operational planning. |
| F4-B4 | Add cancel maintenance block endpoint. | F4-B1, F1-B2 | Blocks are cancelled, not deleted. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F4-F1 | Add maintenance block repository and hooks. | F4-B3 | Hooks list blocks by room and date range. |
| F4-F2 | Add maintenance block create modal from room board. | F4-F1, F3-F4 | Modal is localized, typed, and validates dates. |
| F4-F3 | Add maintenance block cancel action. | F4-F1 | Action has confirmation UI and invalidates room/block queries. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F4-I1 | Verify blocked rooms are excluded from availability. | F4-B2, F6-B3 | Availability count decreases for blocked room dates. |

## Feature 5: Guests And Reservation Core

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F5-B1 | Create `Guest` schema with name, email, phone, and notes. | F0-B1 | Email and phone validation exists. Duplicate handling is explicit. |
| F5-B2 | Create `Reservation` schema with dates, guest count, room type, optional room, status, totals, code, notes, policy acceptance, source, and expiration fields. | F2-B1, F5-B1 | Public reservations can start as `pending_confirmation`. Staff reservations can start as configured by staff flow. |
| F5-B3 | Add reservation status transition helper. | F5-B2 | Invalid transitions are rejected with business conflict errors. |
| F5-B4 | Add reservation code generator. | F5-B2 | Generated codes are unique, stable, and safe to show to guests. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F5-F1 | Add reservation and guest domain types. | F5-B2 | Types reflect backend DTOs and domain statuses. |
| F5-F2 | Add reservation status label/color helpers. | F5-F1, F0-F3 | Helpers are typed and labels are localized. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F5-I1 | Document reservation DTO fields used by public and internal flows. | F5-B2, F5-F1 | Backend DTOs and UI payloads match. |

## Feature 6: Availability

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F6-B1 | Add pure date range validation utility. | F0-B2 | Tests cover checkout after check-in and invalid dates. |
| F6-B2 | Add pure overlap utility for nightly stays. | F6-B1 | Tests cover same-day checkout/check-in as allowed. |
| F6-B3 | Add availability service by room type, date range, and guest count. | F3-B1, F4-B1, F5-B2, F6-B2 | Service subtracts pending, confirmed, checked-in reservations and maintenance/out-of-service rooms. |
| F6-B4 | Add public availability endpoint. | F6-B3 | Returns room types, capacity, price summary, available count, deposit rule, and cancellation policy data. |
| F6-B5 | Add internal assignable-room availability endpoint. | F6-B3 | Staff can fetch physical rooms that are compatible and available for one reservation. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F6-F1 | Add availability business rules for date and guest-count form validation. | F0-F1 | Business tests cover invalid dates and invalid guest count. |
| F6-F2 | Add public availability repository and hook. | F6-B4 | Search is cached by date range and guest count. |
| F6-F3 | Add internal assignable-room repository and hook. | F6-B5 | Hook returns compatible rooms for reservation assignment UI. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F6-I1 | Verify search result counts against seeded room/reservation scenarios. | F6-B4, F6-F2 | UI displays no unavailable room type as bookable. |

## Feature 7: Public Booking Website

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F7-B1 | Add public pending reservation creation endpoint. | F5-B2, F6-B3 | Server rechecks availability before creating a pending reservation. Pending reservations store `expiresAt = createdAt + 24 hours`. |
| F7-B2 | Add policy and deposit fields to public booking response. | F7-B1 | Deposit data uses first-night deposit. Cancellation/deposit policy text reflects domain rules. |
| F7-B3 | Expire pending public reservations after 24 hours. | F7-B1 | Expired pending reservations no longer block availability. Status transition is auditable once audit exists. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F7-F1 | Create public booking page route and search section. | F6-F2 | Date, guest count, loading, empty, and error states work. |
| F7-F2 | Create room type result card for public booking. | F7-F1 | Shows photos, capacity, amenities, nightly price, total price, available count, first-night deposit, and cancellation policy. Price display uses ARS with currency code, for example `ARS 120.000`. |
| F7-F3 | Create public booking form. | F7-F2 | Captures guest name, email, phone, guest count, optional notes, and policy acceptance. |
| F7-F4 | Create public pending request result page. | F7-F3 | Guest sees pending review state, reference information returned by backend, and next steps. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F7-I1 | Submit public booking end to end. | F7-B1, F7-F4 | Pending reservation appears in internal dashboard queue. |
| F7-I2 | Verify pending expiration affects availability. | F7-B3, F6-B4 | Pending reservation blocks inventory before expiration and stops blocking after expiration. |

## Feature 8: Internal Reservations

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F8-B1 | Add reservation list endpoint with filters for status, date range, arrivals, departures, and in-house guests. | F5-B2, F1-B2 | Reception and management can list. Housekeeping cannot edit. |
| F8-B2 | Add staff-created reservation endpoint. | F6-B3 | Server rechecks availability and can create confirmed or pending reservations according to staff choice. |
| F8-B3 | Add reservation date and guest-count update endpoint. | F6-B3 | Server rechecks availability and prepares audit data. |
| F8-B4 | Add staff confirmation endpoint for public pending reservations. | F5-B3, F5-B4 | Confirming generates/returns reservation code and triggers confirmation email. |
| F8-B5 | Add reservation detail endpoint. | F5-B2 | Detail response includes guest, room type, assigned room when staff view allows it, payment summary placeholder, and audit placeholder. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F8-F1 | Add reservations repository, hooks, and query keys. | F8-B1 | Supports filters and mutations with invalidation. |
| F8-F2 | Add today arrivals, departures, and in-house dashboard sections. | F8-F1 | Sections show counts, key guest info, assigned room when available, balance status placeholder, and action links. |
| F8-F3 | Add manual reservation form. | F8-F1, F6-F2 | Metadata-driven form validates dates and guest count. |
| F8-F4 | Add pending reservation review section. | F8-F1 | Staff can confirm or open details. |
| F8-F5 | Show confirmed reservation code after staff confirmation. | F8-B4, F8-F4 | Staff sees the code in success state and reservation detail. |
| F8-F6 | Add reservation detail page shell. | F8-B5, F8-F1 | Detail page has sections for guest, stay, assignment, payment, actions, and audit timeline placeholder. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F8-I1 | Verify public pending to staff confirmation flow. | F7-I1, F8-B4, F8-F5 | Reservation moves from pending to confirmed and no double booking occurs. |
| F8-I2 | Verify confirmation email dispatch. | F8-B4, existing `MailModule` | Confirming reservation calls mail service with guest email, reservation code, dates, and hotel policy summary. |

## Feature 9: Room Assignment

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F9-B1 | Add assign/reassign room endpoint. | F3-B1, F5-B2, F6-B3 | Rejects occupied, maintenance, out-of-service, incompatible, or conflicting rooms. |
| F9-B2 | Add unassign room endpoint for pre-arrival reservations. | F9-B1 | Cannot unassign a checked-in reservation without an approved operational flow. |
| F9-B3 | Update room status consequences for assignment changes. | F9-B1 | Assignment does not make a dirty room ready and does not expose room number publicly. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F9-F1 | Add room assignment selector in reservation detail. | F9-B1, F6-F3 | Only compatible available rooms are selectable. |
| F9-F2 | Show assigned room in calendar, list, and detail staff views. | F9-F1 | Public pages never show room number. |
| F9-F3 | Add reassignment confirmation state. | F9-F1 | Staff sees conflict or success feedback with localized messages. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F9-I1 | Verify reassignment updates reservation and room board. | F9-B1, F9-F2 | Conflicts are rejected server-side and surfaced in UI. |

## Feature 10: Check-In, Check-Out, Housekeeping

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F10-B1 | Add check-in endpoint. | F5-B3, F9-B1 | Cancelled/no-show reservations are blocked. Reservation must have an assigned room that is available and clean/ready. Dirty and cleaning rooms cannot be checked in. |
| F10-B2 | Add check-out endpoint. | F10-B1 | Only checked-in reservations can check out. Checkout marks room as dirty and creates a housekeeping task record. |
| F10-B3 | Add housekeeping task schema and endpoints. | F10-B2 | Housekeeping endpoints support task list, task status update, and room cleaning status update. |
| F10-B4 | Add maintenance report action from housekeeping. | F10-B3, F4-B1 | Housekeeping can report a maintenance issue without editing reservations or payments. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F10-F1 | Add check-in/check-out actions to reservation detail and dashboard lists. | F10-B1, F10-B2 | Confirmation dialogs and localized error states exist. Invalid actions are hidden or disabled. |
| F10-F2 | Add housekeeping work queue page or section. | F10-B3 | Shows dirty, cleaning, ready-for-arrival, and maintenance visibility. |
| F10-F3 | Add housekeeping task status controls. | F10-B3, F10-F2 | Housekeeping can mark task progress and room readiness from the queue. |
| F10-F4 | Add maintenance issue report action from housekeeping queue. | F10-B4, F10-F2 | Action captures reason/notes and updates maintenance visibility. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F10-I1 | Verify checkout creates housekeeping work and room board updates. | F10-B2, F10-F2 | Back-to-back stay room does not become public-ready automatically. |
| F10-I2 | Verify check-in readiness rule. | F10-B1, F10-F1 | Dirty or cleaning assigned rooms cannot be checked in from API or UI. |

## Feature 11: Payments

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F11-B1 | Create `Payment` schema with reservation, amount, method, type, status metadata, and recordedBy. | F5-B2 | Manual methods include cash, card at property, bank transfer, external payment link, and other. Amounts are ARS for MVP. |
| F11-B2 | Add record payment endpoint. | F11-B1 | Staff can record manual payments. Amount must be positive. |
| F11-B3 | Add refund-due and refunded marker endpoints. | F11-B1 | Actual money movement is not automated. |
| F11-B4 | Add derived balance service. | F11-B1 | Balance derives from total minus payments/refunds, not stored as truth. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F11-F1 | Add payment repository, hooks, and balance formatter. | F11-B4 | Formatter displays ARS with currency code and is tested if business logic is present. |
| F11-F2 | Add reservation payment panel. | F11-F1 | Shows total, paid, balance, status, deposit, and payment history. |
| F11-F3 | Add manual payment form. | F11-F1 | Form is typed, metadata-driven, localized, and validates positive amount. |
| F11-F4 | Add refund-due/refunded controls. | F11-F1 | Staff can mark refund state with confirmation. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F11-I1 | Verify payment entry updates balance and reservation detail. | F11-B2, F11-F3 | Cache invalidates reservations/payments after mutation. |

## Feature 12: Cancellation And No-Show

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F12-B1 | Add cancellation endpoint with policy outcome fields. | F5-B3, F11-B4 | Free cancellation, late cancellation, and same-day cancellation follow first-night deposit rule. |
| F12-B2 | Add no-show endpoint. | F5-B3, F11-B4 | No-show is allowed after 11:59 PM on check-in date and releases future inventory only after staff confirms the action. |
| F12-B3 | Add cancellation/no-show payment consequence calculation helper. | F12-B1, F12-B2 | Helper returns penalty, refund due, and retained deposit results. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F12-F1 | Add cancellation dialog. | F12-B1 | Staff sees policy consequence before confirming. |
| F12-F2 | Add no-show dialog. | F12-B2 | Staff sees cutoff/consequence before confirming. |
| F12-F3 | Show cancellation, no-show, refund-due, and refunded states in reservation lists. | F12-F1, F12-F2 | Status labels are localized and visually distinct. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F12-I1 | Verify cancelled/no-show reservations cannot check in. | F10-B1, F12-B2 | Backend rejects and UI hides/disables invalid actions. |

## Feature 13: Audit Log

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F13-B1 | Create `AuditLog` schema and service. | F1-B1 | Captures actor, action, entity, before/after summary, timestamp. |
| F13-B2 | Audit reservation date changes. | F8-B3, F13-B1 | Date changes create audit entries. |
| F13-B3 | Audit room assignment and reassignment. | F9-B1, F13-B1 | Assignment changes create audit entries. |
| F13-B4 | Audit check-in and check-out. | F10-B1, F10-B2, F13-B1 | Operational state changes create audit entries. |
| F13-B5 | Audit payments, cancellations, no-shows, and refunds. | F11-B2, F12-B1, F12-B2, F13-B1 | Money and exception actions create audit entries. |
| F13-B6 | Add audit list endpoint by reservation/entity. | F13-B1 | Staff can view relevant audit history according to permissions. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F13-F1 | Add audit repository and hook. | F13-B6 | Hook fetches audit entries by reservation/entity. |
| F13-F2 | Add audit timeline to reservation detail. | F13-F1 | Timeline shows action, actor, date, and concise summary. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F13-I1 | Verify audit appears after mutation. | F13-B2, F13-F2 | Mutation response or refetch exposes the new audit entry. |

## Feature 14: Reports

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F14-B1 | Add occupancy summary endpoint. | F5-B2, F6-B3 | Returns daily occupancy for a date range. |
| F14-B2 | Add revenue, payments, and pending balance endpoint. | F11-B4 | Returns totals by date range. |
| F14-B3 | Add cancellations and no-shows summary endpoint. | F12-B2 | Returns counts and basic totals by date range. |
| F14-B4 | Add room status summary endpoint. | F3-B1 | Returns counts by room status. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F14-F1 | Add reports repository and hooks. | F14-B1, F14-B2, F14-B3, F14-B4 | Hooks are role-gated and use repository injection. |
| F14-F2 | Add reports page with occupancy, revenue, payments, and balances. | F14-F1 | Page is responsive and includes loading, error, and empty states. |
| F14-F3 | Add cancellation/no-show and room status report sections. | F14-F1 | Uses localized labels and role-gated access. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F14-I1 | Verify management role can view reports and restricted roles are limited. | F14-F3, F1-B2 | Access behavior matches domain roles. |

## Feature 15: Realtime Updates

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F15-B1 | Emit events for reservation changes through existing realtime module. | F8-B1 | Event includes entity id, type, and action. |
| F15-B2 | Emit events for room and housekeeping changes. | F10-B3 | Event includes room id and affected task/status. |
| F15-B3 | Emit events for payment changes. | F11-B2 | Event includes reservation id and payment action. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F15-F1 | Add Socket.IO provider/hook if not already present in UI. | F15-B1 | UI has one managed connection lifecycle and no scattered sockets. |
| F15-F2 | Invalidate React Query reservation caches on realtime events. | F15-F1 | Reservation lists/details update without manual refresh. |
| F15-F3 | Invalidate room, housekeeping, and payment caches on realtime events. | F15-F1 | Room board, housekeeping queue, and payment panels update without manual refresh. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F15-I1 | Verify two browser sessions receive operational updates. | F15-B1, F15-F3 | Mutation in one session updates the other session. |

## Feature 16: Seed And Demo Data

### Backend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F16-B1 | Add seed script for MVP roles/users. | F1-B1 | Script creates admin, reception, housekeeping, and management demo users safely. |
| F16-B2 | Add seed script for room types and rooms. | F2-B1, F3-B1 | Script creates realistic room inventory with multiple statuses. |
| F16-B3 | Add seed script for sample reservations, payments, maintenance blocks, and housekeeping tasks. | F4-B1, F5-B2, F10-B3, F11-B1 | Script creates scenarios for arrivals, departures, in-house, pending, dirty rooms, and blocked rooms. |

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F16-F1 | Add demo-data assumptions to UI empty and loading states where useful. | F16-B1 | Empty states remain real product states, not developer instructions. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F16-I1 | Verify seed data supports all MVP demo flows. | F16-B3 | Public booking, staff confirmation, check-in, checkout, housekeeping, payment, cancellation, and report flows can be demonstrated. |

## Feature 17: Design Brief And UX Alignment

### Frontend Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F17-F1 | Create `hotel-design.md` as a UI/UX designer brief. | Domain decisions, F0-F2 | Brief describes public booking, internal dashboard, reservation detail, room board, housekeeping queue, payments, reports, responsive behavior, and dark mode direction. |
| F17-F2 | Include page-level mockup descriptions, visual tone, layout density, navigation model, and component inventory. | F17-F1 | Designer can produce wireframes without asking what screens exist. |

### Integration Tasks

| ID | Task | Dependencies | Acceptance Criteria |
|---|---|---|---|
| F17-I1 | Cross-check design brief against MVP plan. | F17-F2 | No designed screen depends on out-of-scope MVP features. |

## Recommended Build Order

1. Build Feature 0 and Feature 1 first.
2. Build Feature 2 and Feature 3 next so inventory exists.
3. Build Feature 4 and Feature 5 to support blocking and reservations.
4. Build Feature 6 before any booking UI.
5. Build Feature 7 public booking.
6. Build Feature 8 internal reservation operations.
7. Build Feature 9 room assignment.
8. Build Feature 10 check-in, check-out, and housekeeping.
9. Build Feature 11 payments.
10. Build Feature 12 cancellation and no-show.
11. Build Feature 13 audit logs.
12. Build Feature 14 reports.
13. Build Feature 15 realtime updates.
14. Build Feature 16 seed/demo data.
15. Keep Feature 17 aligned throughout implementation.

## MVP Review Checklist

- Public guests cannot book unavailable inventory.
- Public guests never see room numbers.
- Pending public reservations expire after 24 hours.
- Staff can confirm pending reservations and trigger reservation code email.
- Check-in requires a confirmed reservation, assigned room, and clean/ready room status.
- Checkout creates housekeeping work and marks the room dirty.
- Payments are manual and ARS-only for MVP.
- Balances are derived, not manually edited.
- Cancellations and no-shows apply the first-night deposit rule.
- Important operational actions are audited.
- Management can see occupancy, revenue, balances, cancellations/no-shows, and room status summaries.
- UI is responsive, dark-mode compatible, localized in English and Argentine Spanish, and role-aware.
