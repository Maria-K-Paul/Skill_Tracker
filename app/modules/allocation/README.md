# Allocation Module

Runs the post-booking-cutoff process that assigns each booked student a hall and seat.

## Tables
- `allocations` — maps `slot_booking_id` → `hall_id` + `seat_no`.

## Key Rules
- Triggered after `booking_cutoff`; the slot must be in `open` or `closed` status.
- Students are randomly shuffled (via `secrets.SystemRandom`) before distribution.
- Distribution is balanced across linked halls by capacity.
- Each allocation triggers `secret_code/service.generate_code_for_student()`.
- Students **never** see their hall or seat — this is admin/hall-incharge only.
- A scheduled job placeholder should auto-trigger at `booking_cutoff`.
