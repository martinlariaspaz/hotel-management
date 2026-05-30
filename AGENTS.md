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
