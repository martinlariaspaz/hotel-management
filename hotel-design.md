# Hotel Design Brief

## Purpose

This document describes the MVP front-end direction for a UI/UX designer. It is not a marketing site brief. The first screen should be useful immediately: guests should search availability, and staff should operate the hotel.

The product has two experiences:

- Public booking website for guests.
- Internal hotel operations dashboard for staff.

The design should feel professional, calm, and operationally trustworthy. Public pages can feel warmer and more hospitality-focused. Internal pages should be denser, faster to scan, and built for repeated daily use.

## Product Personality

- Clear before decorative.
- Warm but not luxurious for its own sake.
- Operationally precise.
- Friendly for guests.
- Quiet and efficient for staff.
- Designed for both light and dark mode.
- Responsive from mobile to large desktop monitors.

Avoid oversized marketing hero sections, decorative background blobs, one-note palettes, heavy gradients, and playful visuals that reduce trust. Cards should use 8px radius or less unless a Mantine token requires otherwise.

## Visual Language

### Color Direction

Use a balanced hotel operations palette:

- Neutral base: white, soft gray, dark gray for dark mode.
- Trust/action: blue for primary actions.
- Availability/ready: teal or green.
- Warning/pending: amber.
- Critical/blocked/cancelled: red.
- Housekeeping/cleaning: cyan or light blue.
- Management/reporting accents: restrained violet or indigo, used lightly.

Do not let the app become only blue, only teal, only beige, or only purple. Status colors must be consistent across public and internal views.

### Typography

- Use clear sans-serif typography through Mantine defaults or a similar product-safe font.
- Internal dashboard headings should be compact, not hero-sized.
- Public booking headings can be larger, but the search form must stay visible in the first viewport.
- Avoid negative letter spacing.
- Keep table, badge, and button text readable on mobile.

### Icons

Use Lucide-style line icons:

- Calendar for dates.
- Bed for rooms.
- Users for guests.
- Credit card or receipt for payments.
- Broom/sparkle/check for housekeeping.
- Wrench for maintenance.
- Alert triangle for conflicts.
- Mail for confirmation email.
- Bar chart for reports.

Icon buttons need tooltips when the icon is not obvious.

## Information Architecture

### Public Routes

- `/booking`: availability search and room type results.
- `/booking/request`: guest booking form for selected room type.
- `/booking/pending`: pending request confirmation.

### Staff Routes

- `/login`: staff sign-in.
- `/dashboard`: today operations.
- `/reservations`: reservation list and filters.
- `/reservations/:id`: reservation detail and actions.
- `/rooms`: room inventory and room status board.
- `/housekeeping`: housekeeping queue.
- `/payments`: payment-focused list or filtered reservations.
- `/reports`: management reports.
- `/settings`: admin setup for room types, rooms, users, and policies.

Navigation should be role-aware:

- Admin sees all areas.
- Reception sees dashboard, reservations, rooms, payments, and selected reports if allowed.
- Housekeeping sees room board and housekeeping queue only.
- Management sees dashboard, reports, reservations, and payments in mostly read-only mode.

## Public Booking Mockup

### First View

The public booking page should open directly on the booking experience.

Layout:

- Top navigation with hotel name, language switch, and staff login link kept secondary.
- Large real hotel/room image as a background or wide media band.
- Availability search placed prominently over or below the image, not hidden below marketing content.
- Date inputs for check-in and check-out.
- Guest count stepper.
- Search button with calendar/search icon.
- Short trust row under search: clear prices, first-night deposit, free cancellation until 48 hours before check-in.

The next section should be slightly visible below the fold on desktop and mobile.

### Availability Results

Room type result cards should be factual and inspectable:

- Large room image thumbnail or carousel.
- Room type name.
- Capacity and bed setup.
- Amenities as compact icon/text chips.
- Availability count, for example "2 rooms left".
- Nightly price and total price in ARS format, for example `ARS 120.000`.
- First-night deposit amount.
- Cancellation policy summary.
- Primary action: request booking.
- Secondary action: view details.

Empty state:

- Clear explanation that no room types match the date/guest count.
- Keep search controls visible so guests can adjust dates quickly.

### Booking Form

The form should feel short and safe.

Fields:

- Guest full name.
- Email.
- Phone.
- Guest count, prefilled from search.
- Optional notes.
- Policy acceptance checkbox.

Order summary:

- Room type.
- Dates and nights.
- Guests.
- Total in ARS.
- First-night deposit.
- Cancellation policy.
- Message that staff will review and confirm within 24 hours.

Result screen:

- Pending state, not final booking language.
- Reference information returned by the backend.
- Explanation that staff will confirm by email.
- If already confirmed later by staff, the reservation code is shown on screen and sent by email.

## Staff Login Mockup

The login screen should stay simple:

- Centered panel with hotel/product name.
- Username and password fields.
- Language and dark-mode controls accessible but unobtrusive.
- Error state for invalid credentials.
- No promotional content.

The current repo already has the basis for this screen. The future design should preserve its directness while refining spacing, visual hierarchy, and mobile fit.

## Internal Dashboard Mockup

### Dashboard First View

The dashboard is a work surface, not a landing page.

Top area:

- Page title: operations panel.
- Date selector defaulting to today.
- Role-aware action buttons.
- Current user and logout controls.

Primary KPI strip:

- Occupancy today.
- Arrivals today.
- Departures today.
- In-house guests.
- Pending confirmations.
- Rooms needing cleaning.

Each KPI should be clickable and filter the relevant list below.

Main content grid:

- Left wide column: arrivals, departures, in-house guests.
- Right column: room status summary and pending confirmations.
- On wide monitors, show three operational columns.
- On mobile, stack sections in priority order: pending actions, arrivals, departures, rooms.

### Today Arrivals

Each row should show:

- Guest name.
- Room type.
- Assigned room if available.
- Arrival date.
- Guest count.
- Balance/deposit status.
- Room readiness badge.
- Actions: assign room, check in, open details.

Check-in action should be disabled when the room is dirty/cleaning or unassigned, with a clear localized reason.

### Today Departures

Each row should show:

- Guest name.
- Room number.
- Balance status.
- Checkout action.
- Notes indicator.

Checkout should warn that the room will become dirty and create housekeeping work.

## Reservation Detail Mockup

Reservation detail is the operational control center.

Header:

- Reservation code.
- Status badge.
- Guest name.
- Stay dates and nights.
- Primary actions based on status.

Sections:

- Guest information.
- Stay details.
- Room assignment.
- Payment summary.
- Internal notes.
- Action history/audit timeline.

Right-side action panel on desktop:

- Confirm pending reservation.
- Assign/reassign room.
- Check in.
- Check out.
- Record payment.
- Cancel.
- Mark no-show.

On mobile, actions move into a sticky bottom action button or compact action menu.

Important states:

- Pending reservation: emphasize 24-hour expiration.
- Confirmed reservation: show assigned room readiness.
- Checked-in reservation: payment and checkout become prominent.
- Cancelled/no-show: actions are locked except audit/payment review.

## Room Board Mockup

The room board should be scannable from several feet away at reception.

Layout:

- Filters: room type, floor, status.
- Status columns or grouped sections:
  - Available/ready.
  - Reserved.
  - Occupied.
  - Dirty.
  - Cleaning.
  - Maintenance.
  - Out of service.
- Room tiles with room number, room type, current/next guest, and quick status action.

Tile behavior:

- Color by status.
- Small icons for housekeeping, maintenance, and reservation.
- Click opens room detail or reservation detail.
- Housekeeping role sees cleaning controls but not payment/reservation editing.

Maintenance action:

- Create block modal with date range, reason, and notes.
- Cancel block action with confirmation.

## Reservation Calendar Mockup

The MVP can use a simple operational calendar rather than a complex drag-and-drop planner.

View:

- Rows are physical rooms.
- Columns are dates.
- Reservation bars show guest name/status.
- Maintenance blocks are distinct from reservations.
- Back-to-back stays can touch on checkout/check-in date.
- Dirty/cleaning state should be visible for same-day turnovers.

The calendar is staff-only. Public guests never see physical room numbers.

## Housekeeping Queue Mockup

This screen is for fast mobile and tablet use.

Top filters:

- Dirty.
- Cleaning.
- Ready.
- Maintenance reported.
- Ready for arrival today.

Task card:

- Room number.
- Room type.
- Current status.
- Next arrival time/date if relevant.
- Notes.
- Actions: start cleaning, mark ready, report maintenance.

The layout should support one-handed phone use. Buttons should be large enough for staff moving through rooms.

## Payments Mockup

Payment UI should be clear and conservative.

Reservation payment panel:

- Total amount.
- First-night deposit amount.
- Paid amount.
- Pending balance.
- Payment status.
- Payment history table.
- Record payment button.
- Mark refund due/refunded actions when applicable.

Manual payment form:

- Amount.
- Method: cash, card at property, bank transfer, external payment link, other.
- Date.
- Notes.

The UI must not imply automatic payment capture or automatic refund processing.

## Reports Mockup

Reports are for management review, not accounting replacement.

Report sections:

- Occupancy by date range.
- Revenue by date range.
- Payments received.
- Pending balances.
- Cancellations.
- No-shows.
- Room status summary.

Visuals:

- Compact KPI cards.
- Simple line/bar charts when useful.
- Tables for drill-down.
- Date range filter always visible.

Do not design complex accounting exports for MVP unless they are later requested.

## Component Inventory

The designer should prepare these reusable UI pieces:

- App shell with role-aware sidebar/top navigation.
- Status badge system for reservation, room, payment, housekeeping, and maintenance.
- Date range search form.
- Room type result card.
- Reservation summary row.
- Reservation detail header.
- Action confirmation modal.
- Room status tile.
- Room board filter bar.
- Housekeeping task card.
- Payment summary panel.
- Manual payment form.
- Audit timeline item.
- Report KPI card.
- Empty state.
- Loading skeleton.
- Error state.

## Responsive Behavior

### Desktop

- Use wide operational layouts with two or three columns.
- Keep key actions visible without excessive scrolling.
- Tables are acceptable when they improve scanning.

### Tablet

- Preserve dashboard sections but reduce columns.
- Room board can switch from columns to grouped grids.
- Housekeeping queue should behave close to mobile.

### Mobile

- Public booking must remain fully usable.
- Staff pages should prioritize action queues over large tables.
- Use stacked cards instead of horizontal tables.
- Sticky bottom actions are acceptable for reservation detail.
- Avoid horizontal scrolling on normal content screens.

## Dark Mode

Dark mode is required.

Design requirements:

- Status colors must remain legible in dark mode.
- Cards and panels should use Mantine color tokens rather than fixed backgrounds.
- Avoid low-contrast gray text.
- Charts and badges need dark-mode variants.

## Accessibility

- All controls need clear labels.
- Icon-only actions need accessible names and tooltips.
- Color cannot be the only indicator of status.
- Error messages should appear next to the field or relevant action.
- Keyboard navigation should work for forms, modals, and major actions.
- Confirmation dialogs should explain operational consequences plainly.

## Copy Direction

All visible copy must be available in English and Argentine Spanish.

Tone:

- Public booking: clear, polite, reassuring.
- Internal dashboard: concise, operational, direct.

Avoid long instructional paragraphs inside the app. Use labels, badges, helper text, and confirmation messages only where they directly prevent mistakes.

## MVP Design Constraints

- Do not design OTA integrations, loyalty flows, guest modification portal, dynamic pricing, or payment gateway screens.
- Do not promise instant confirmation for public requests; the MVP creates pending requests reviewed by staff.
- Do not show physical room numbers to public guests.
- Do not design check-in into dirty or cleaning rooms.
- Do not design automatic refunds.
- Do not hide the 24-hour pending expiration rule from staff.

## Designer Deliverables

Recommended deliverables:

- Light and dark mode visual direction.
- Public booking desktop and mobile mockups.
- Staff dashboard desktop and mobile mockups.
- Reservation detail desktop and mobile mockups.
- Room board desktop/tablet mockups.
- Housekeeping mobile mockup.
- Payment panel mockup.
- Reports page mockup.
- Status color and badge system.
- Component inventory with interaction states.
