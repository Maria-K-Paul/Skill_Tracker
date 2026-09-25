# Users Module

Manages student profiles, departments, academic years, and domain incharge scoping.

## Tables
- `students` — links a `user` to a `department` and `academic_year`.
- `departments` — department lookup.
- `academic_years` — academic year labels.
- `domain_incharge` — admin ↔ track scope mapping (not a separate role).

## Key Rules
- `domain_incharge` is an admin user scoped to one `track_id`. Check role via `auth/service.check_role()`.
- Student-facing endpoints must only expose their own data.
- Do NOT import `auth/models.py` — use `core/dependencies.get_current_user()` for identity.
