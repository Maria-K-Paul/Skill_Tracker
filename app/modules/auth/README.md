# Auth Module

Handles user registration, login, JWT issuance, refresh token rotation, and role enforcement.

## Tables
- `users` — platform users (students and admins).
- `roles` — lookup: `student`, `admin`.
- `user_roles` — many-to-many join.
- `refresh_tokens` — hashed long-lived tokens for rotation.

## Key Rules
- Roles are stored in the `roles` table, not hardcoded in JWT.
- `domain_incharge` is an **admin** with a `track_id` scope — not a separate role.
- Audit log is written on failed login and lockout events via `core/audit.py`.
- Do NOT import other module models here; use `core/` only.

## Endpoints (planned)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /register | public | Register new user |
| POST | /login | public | Authenticate, get tokens |
| POST | /refresh | public | Rotate refresh token |
| POST | /logout | bearer | Revoke refresh token |
