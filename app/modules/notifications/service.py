"""
app/modules/notifications/service.py
---------------------------------------
Placeholder notification service.

Notification types to implement:
- booking_confirmation: sent when a student books a slot.
- result_published:     sent when a result is available.
- reminder:             sent N hours before a booked slot.

No database table yet — delivery mechanism TBD (email / in-app / push).

TODO: implement send_booking_confirmation(student_id, booking_id) → None
TODO: implement send_result_notification(student_id, result_id) → None
TODO: implement send_slot_reminder(student_id, booking_id) → None
TODO: implement _send(user_id, type, message) — actual delivery (email/queue)
TODO: decide on delivery transport (SMTP, SendGrid, Firebase, etc.)
"""


async def send_booking_confirmation(student_id: int, booking_id: int) -> None:
    """Notify a student that their slot booking is confirmed."""
    # TODO: compose message, call _send()
    pass


async def send_result_notification(student_id: int, result_id: int) -> None:
    """Notify a student that their exam result is available."""
    # TODO: compose message, call _send()
    pass


async def send_slot_reminder(student_id: int, booking_id: int) -> None:
    """Send a reminder notification before a booked slot."""
    # TODO: compute send time (e.g. 24h before slot), call _send()
    pass


async def _send(user_id: int, notification_type: str, message: str) -> None:
    """
    Internal delivery function. Dispatches to the configured transport.
    TODO: implement once transport is decided.
    """
    pass
