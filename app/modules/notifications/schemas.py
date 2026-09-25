"""
app/modules/notifications/schemas.py
---------------------------------------
Pydantic schemas for the notifications module.

TODO: Add BookingConfirmationPayload.
TODO: Add ResultPublishedPayload.
TODO: Add ReminderPayload.
TODO: Add NotificationResponse for listing a user's notifications.
"""

from pydantic import BaseModel
from datetime import datetime


class NotificationPayload(BaseModel):
    """Generic notification payload — to be specialised per type."""
    user_id: int
    type: str
    message: str
    # TODO: add metadata dict for type-specific data
