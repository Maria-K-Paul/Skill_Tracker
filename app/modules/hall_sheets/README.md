# Hall Sheets Module

Admin-only view and print module for hall-wise student seating.

## No Own Table
Composes data from:
- `allocations` — hall + seat assignments.
- `secret_codes` — encrypted codes (revealed only for print).
- `slot_bookings` — student identity.

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/hall-sheets/{slot_id}` | Hall-wise list, codes hidden |
| GET | `/hall-sheets/{slot_id}/{hall_id}/print` | Printable sheet with codes (audited) |

## Key Rules
- The hall-wise list **hides** secret codes.
- The print endpoint calls `secret_code/service.reveal_code_for_admin()` per row.
- Every code reveal writes an entry to `audit_log` via `core/audit.py`.
- The printable sheet is handed physically to a hall incharge — a real person, not a system user.
