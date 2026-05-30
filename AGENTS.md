## Frontend Agent

See: `agents/frontend-agent.md`

Use this agent for all frontend tasks involving React, Vite, TypeScript, Mantine, React Query, React Hook Form, Zustand, React Router, Lucide React, and Socket.IO client integration.

## NestJS Backend Agent

See: `agents/nestjs-backend-agent.md`

Use this agent for all backend tasks involving NestJS, MongoDB/Mongoose, JWT authentication, WebSockets, Socket.IO, validation, configuration, email, and hotel business logic.

See: `agents/hotel-domain-agent.md`

Use this agent when the task requires hotel business knowledge, room reservations, guest flows, internal hotel operations, payments, housekeeping, check-in/check-out, or availability rules.

## System Execution Planner Agent

See: `agents/system-execution-planner-agent.md`

Use this agent when the project needs planning, task decomposition, technical sequencing, task files, clarification questions, or execution strategy before implementation.

## Orchestrator Agent

See: `agents/orchestrator-agent.md`

Use this agent as the main coordinator for complex work. It decides when to involve the Hotel Domain Agent, System Execution Planner Agent, Frontend Agent, NestJS Backend Agent, or other specialized agents.

# Agent Usage Rules

Use the Frontend Agent when the task affects:

- React components.
- Mantine UI.
- Forms.
- Routing.
- React Query.
- Zustand.
- Public booking pages.
- Admin dashboard pages.
- Socket.IO client behavior.

Use the NestJS Backend Agent when the task affects:

- NestJS modules.
- Controllers.
- Services.
- DTOs.
- Mongoose schemas.
- Authentication.
- Authorization.
- Reservation rules.
- Availability logic.
- Payments.
- Socket.IO gateways.
- Email notifications.
- Backend validation.

Use the Hotel Domain Agent when a task requires hotel business reasoning.

Use the System Execution Planner Agent before large implementation work, especially when a feature must be divided into small `.md` task files.

# Persistent Agent Memory

Feature 0 foundation follow-up notes:

- Keep housekeeping room navigation scoped to operational room status and cleaning visibility only. Housekeeping must not gain access to admin inventory, rate setup, reservation editing, or payment workflows through room navigation.
- Add backend/UI status parity tests when status contracts evolve, so reservation, room, payment, and role values cannot drift between backend enums and UI union types.
- Use specific hotel-business conflict codes in future backend features instead of only a generic conflict code, for example `ROOM_NOT_AVAILABLE`, `CHECK_IN_ROOM_NOT_READY`, or `PAYMENT_HISTORY_DELETE_BLOCKED`.
