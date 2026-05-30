# Backend

Base NestJS API for the hotel-management project.

## Stack

- NestJS
- MongoDB with Mongoose
- Socket.IO gateway through NestJS WebSockets
- SMTP mail service with Nodemailer

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run start:dev
```

The HTTP API listens on `PORT` and uses the global prefix `/api`.

Health check:

```bash
GET /api/health
```

Socket namespace:

```text
/realtime
```

Useful events:

- `ping`
- `room:join`
- `room:leave`
- `room:message`

## MongoDB

Set `MONGODB_URI` and optionally `MONGODB_DB` in `.env`.

## SMTP

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`.
Inject `MailService` in feature modules and call `sendMail`.

The included Docker Compose file runs Mailpit for local SMTP testing:

```text
SMTP server: localhost:1025
Web inbox: http://localhost:8025
```
