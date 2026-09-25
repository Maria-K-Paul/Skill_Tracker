# Halls Module

Admin-only management of physical exam halls.

## Tables
- `halls` — name, location, capacity.

## Key Rules
- Halls are admin-managed; students never see hall information.
- Halls are linked to slots via `slot_halls` (managed in the `slots` module).
- Capacity is read by `allocation/service` when distributing students.
