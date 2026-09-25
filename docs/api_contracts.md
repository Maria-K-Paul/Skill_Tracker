# API Contracts — Skill Leveling Platform

> All routes are prefixed with `/api/v1/<module-name>`.
> Full interactive docs available at `/docs` (Swagger UI) when the server is running.

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

## Base URL

```
http://localhost:8000/api/v1
```

---

## Modules & Route Prefixes

| Module          | Prefix                     | Roles Allowed       |
|-----------------|----------------------------|---------------------|
| auth            | /auth                      | public + authenticated |
| users           | /users                     | admin, student      |
| domains         | /domains                   | admin, student      |
| exams           | /exams                     | admin               |
| slots (admin)   | /slots/admin               | admin               |
| slots (student) | /slots/student             | student             |
| halls           | /halls                     | admin               |
| allocation      | /allocation                | admin               |
| secret_code     | /secret-code               | admin               |
| hall_sheets     | /hall-sheets               | admin               |
| progress        | /progress                  | admin, student      |
| attempts        | /attempts                  | admin, student      |
| ai_engine       | /ai-engine                 | admin               |
| analytics       | /analytics                 | admin               |
| notifications   | /notifications             | admin, student      |

---

## Standard Response Envelope

```json
{
  "data": { ... },
  "message": "OK",
  "status_code": 200
}
```

## Error Response

```json
{
  "detail": "Human-readable error message",
  "error_code": "MACHINE_READABLE_CODE",
  "status_code": 422
}
```

---

## Key Endpoints (placeholders — to be expanded per module)

### Health
- `GET /health` — liveness check, no auth required.

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Slots (Student)
- `GET  /slots/student/available`
- `POST /slots/student/book`
- `DELETE /slots/student/cancel/{booking_id}`
- `GET  /slots/student/my-bookings`

### Hall Sheets (Admin)
- `GET  /hall-sheets/{slot_id}` — hall-wise list, codes hidden
- `GET  /hall-sheets/{slot_id}/{hall_id}/print` — printable sheet with codes (audited)

### AI Engine (Admin)
- `POST /ai-engine/generate` — trigger question generation for a topic

---

> TODO: expand each module's contract with full request/response schemas once service layer is implemented.
