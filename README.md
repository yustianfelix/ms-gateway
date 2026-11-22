# ms-gateway

A small HTTP gateway for the authentication and attendance services.

## Routes

- `/auth` and `/auth/*` proxy to `AUTH_SERVICE_URL`.
- `/attendance` and `/attendance/*` proxy to `ATTENDANCE_SERVICE_URL`.

The gateway prefix is removed before forwarding, so `/auth/login` is sent to the auth service as `/login`. All HTTP methods, query strings, and request/response headers are forwarded.

## Configuration

Set the upstream service URLs as needed. Defaults are `http://localhost:3001` for auth and `http://localhost:3002` for attendance.

```bash
AUTH_SERVICE_URL=http://localhost:3001
ATTENDANCE_SERVICE_URL=http://localhost:3002
PORT=3000
```
