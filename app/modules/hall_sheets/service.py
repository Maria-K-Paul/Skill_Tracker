"""
app/modules/hall_sheets/service.py
------------------------------------
Read-only service: composes hall-wise data from allocation + secret_code + slot_booking.

This module has no own database table.
Cross-module calls:
- allocation/service — to fetch allocation records for a slot.
- secret_code/service.reveal_code_for_admin() — only for the print endpoint, audited.
- No direct import of other modules' models.py or router.py.

TODO: implement get_hall_sheet(slot_id) → list[HallSheetRow]
      — all halls for the slot, students + seats, codes hidden.
TODO: implement get_printable_hall_sheet(slot_id, hall_id, actor_user_id, ip)
      → list[PrintableHallSheetRow]
      — calls secret_code/service.reveal_code_for_admin() per row (each is audited).
"""


async def get_hall_sheet(slot_id: int) -> list:
    """
    Return hall-wise student + seat data for a slot.
    Secret codes are NOT included in this response.

    TODO: join allocations + slot_bookings + halls, grouped by hall.
    """
    return []


async def get_printable_hall_sheet(
    slot_id: int, hall_id: int, actor_user_id: int, ip_address: str
) -> list:
    """
    Return printable hall sheet rows including decrypted secret codes.
    Each code reveal is audited via secret_code/service.reveal_code_for_admin().
    Admin only.

    TODO: fetch allocations for hall, call reveal_code_for_admin per row.
    """
    return []
