# Slots Module

Manages exam slot creation, hall linking, and student bookings.

## Tables
- `slots` — exam sitting windows (not hall-linked at creation).
- `slot_halls` — admin links halls to a slot after creation.
- `slot_bookings` — student books a slot; receives `attempt_number`.

## Key Rules
- Students **never** pick or see a hall — booking is slot-only.
- Booking is gated by `progress/service.check_eligibility()`.
- Cancellation is only allowed before `booking_cutoff`.
- Capacity = sum of linked hall capacities; enforced by `check_capacity()`.
- Two routers: `router_admin.py` (admin) and `router_student.py` (student).
