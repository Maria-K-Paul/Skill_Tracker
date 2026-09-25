# Notifications Module

Handles event-driven notifications to students (booking confirmation, results, reminders).

## No Dedicated Table Yet
Notification delivery mechanism is TBD. Options under consideration:
- Email (SMTP / SendGrid)
- In-app notification feed (requires a `notification_log` table — design pending)
- Push notifications

## Planned Notification Types
| Type | Trigger | Recipient |
|---|---|---|
| `booking_confirmation` | Student books a slot | Student |
| `result_published` | Score computed after submission | Student |
| `reminder` | N hours before booked slot | Student |

## Module Interactions
- Called by `slots/service.book_slot()` → booking confirmation.
- Called by `attempts/service.score_and_finish()` → result notification.
- Called by a scheduled job → reminder N hours before slot.
