"""
app/modules/hall_sheets/service.py
------------------------------------
Read-only service: composes hall-wise data from allocation + secret_code + slot_bookings.

This module has no own database table.

Cross-module calls:
  - secret_code.service.reveal_code_for_admin() — ONLY for the print endpoint.
    Each call writes one audit log entry — this is intentional and per spec.
    Do NOT batch or cache reveals to "optimize" away per-row auditing.

Security:
  - get_hall_sheet() returns HallSheetRow objects which have NO code field.
  - get_printable_hall_sheet() returns HallSheetPrintRow objects which include
    the plaintext code — one audit log write per row, always.
"""

from io import BytesIO
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from app.modules.allocation.models import Allocation
from app.modules.hall_sheets.schemas import HallSheetPrintRow, HallSheetRow
from app.modules.secret_code import service as secret_code_service
from app.modules.secret_code.models import SecretCode
from app.modules.slots.models import SlotBooking


async def get_hall_sheet(
    slot_id: int, db: AsyncSession
) -> list[HallSheetRow]:
    """
    Return hall-wise student + seat data for a slot.

    Secret codes are NOT included in any row — this is enforced by the
    HallSheetRow schema which has no code field whatsoever.

    Joins: allocations ← slot_bookings, allocations ← halls (for hall_id grouping).
    """
    # Join allocations with slot_bookings to filter by slot_id.
    result = await db.execute(
        select(
            Allocation.id.label("allocation_id"),
            Allocation.hall_id,
            Allocation.seat_no,
            SlotBooking.student_id,
            SlotBooking.attempt_number,
            SlotBooking.status.label("booking_status"),
        )
        .join(SlotBooking, SlotBooking.id == Allocation.slot_booking_id)
        .where(SlotBooking.slot_id == slot_id)
        .order_by(Allocation.hall_id, Allocation.seat_no)
    )
    rows = result.mappings().all()

    return [
        HallSheetRow(
            allocation_id=row["allocation_id"],
            hall_id=row["hall_id"],
            seat_no=row["seat_no"],
            student_id=row["student_id"],
            # student_display_name: pull from booking/user join in a future
            # integration when users module provides a lookup.
            # TODO(integration): replace with actual user name lookup — users module owner.
            student_display_name=f"Student:{str(row['student_id'])[:8]}",
            attempt_number=row["attempt_number"],
            booking_status=str(row["booking_status"]),
        )
        for row in rows
    ]


async def get_printable_hall_sheet(
    slot_id: int,
    hall_id: int,
    revealed_by_user_id: int,
    db: AsyncSession,
) -> list[HallSheetPrintRow]:
    """
    Return printable hall sheet rows for a specific hall, including decrypted codes.

    PER-ROW AUDIT CONTRACT (DO NOT BATCH OR SKIP):
      For every row, this function calls secret_code.service.reveal_code_for_admin(),
      which writes one audit log entry.  The spec intentionally requires one entry
      per row per call — do not "optimize" this into a single batch audit write.

    Args:
        slot_id:             UUID of the slot.
        hall_id:             UUID of the specific hall to print.
        revealed_by_user_id: UUID of the admin requesting the print.
        db:                  Async SQLAlchemy session.

    Returns:
        List of HallSheetPrintRow with plaintext codes attached.
    """
    from app.modules.secret_code import service as secret_code_service

    # Fetch allocations for this specific hall + slot combination.
    result = await db.execute(
        select(
            Allocation.id.label("allocation_id"),
            Allocation.hall_id,
            Allocation.seat_no,
            SlotBooking.student_id,
            SlotBooking.attempt_number,
            SecretCode.id.label("secret_code_id"),
        )
        .join(SlotBooking, SlotBooking.id == Allocation.slot_booking_id)
        .join(SecretCode, SecretCode.allocation_id == Allocation.id)
        .where(
            SlotBooking.slot_id == slot_id,
            Allocation.hall_id == hall_id,
        )
        .order_by(Allocation.seat_no)
    )
    rows = result.mappings().all()

    print_rows: list[HallSheetPrintRow] = []
    for row in rows:
        # Per-row reveal + audit — one audit log entry per student, per call.
        # This is INTENTIONAL per spec — do not batch.
        plaintext = await secret_code_service.reveal_code_for_admin(
            secret_code_id=row["secret_code_id"],
            revealed_by_user_id=revealed_by_user_id,
            db=db,
        )
        print_rows.append(
            HallSheetPrintRow(
                allocation_id=row["allocation_id"],
                hall_id=row["hall_id"],
                seat_no=row["seat_no"],
                student_id=row["student_id"],
                # TODO(integration): replace with actual user name lookup — users module owner.
                student_display_name=f"Student:{str(row['student_id'])[:8]}",
                attempt_number=row["attempt_number"],
                secret_code=plaintext,
            )
        )
    return print_rows


async def generate_hall_sheet_pdf(
    slot_id: int,
    hall_id: int,
    revealed_by_user_id: int,
    db: AsyncSession,
) -> BytesIO:
    """
    Generate a PDF hall sheet for a specific hall including secret codes.

    Returns a BytesIO buffer containing the PDF that can be sent as a response.
    """
    # Get the printable hall sheet data
    rows = await get_printable_hall_sheet(slot_id, hall_id, revealed_by_user_id, db)

    # Fetch hall and slot details
    from app.modules.halls.models import Hall
    from app.modules.slots.models import Slot

    hall = await db.get(Hall, hall_id)
    slot = await db.get(Slot, slot_id)

    if not hall or not slot:
        raise ValueError("Hall or Slot not found")

    # Create PDF buffer
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                          rightMargin=30, leftMargin=30,
                          topMargin=50, bottomMargin=30)

    # Container for the PDF elements
    elements = []

    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#0F0F0F'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#606060'),
        spaceAfter=20,
        alignment=TA_CENTER
    )

    # Title
    title = Paragraph("Exam Hall Sheet", title_style)
    elements.append(title)

    # Hall and slot information
    info_text = f"""
    <b>Hall:</b> {hall.name}<br/>
    <b>Location:</b> {hall.location}<br/>
    <b>Capacity:</b> {hall.capacity}<br/>
    <b>Date:</b> {slot.date.strftime('%Y-%m-%d') if slot.date else 'N/A'}<br/>
    <b>Time:</b> {slot.start_time.strftime('%H:%M') if slot.start_time else 'N/A'} - {slot.end_time.strftime('%H:%M') if slot.end_time else 'N/A'}<br/>
    <b>Total Students:</b> {len(rows)}
    """
    info = Paragraph(info_text, subtitle_style)
    elements.append(info)
    elements.append(Spacer(1, 20))

    # Security warning
    warning_style = ParagraphStyle(
        'Warning',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.red,
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    warning = Paragraph("⚠️ CONFIDENTIAL - Contains Secret Codes - For Invigilator Use Only", warning_style)
    elements.append(warning)
    elements.append(Spacer(1, 10))

    # Create table data
    table_data = [
        ['Seat No.', 'Student ID', 'Student Name', 'Attempt', 'Secret Code']
    ]

    for row in rows:
        table_data.append([
            str(row.seat_no),
            str(row.student_id)[:8] + '...',
            row.student_display_name,
            str(row.attempt_number),
            row.secret_code
        ])

    # Create table
    table = Table(table_data, colWidths=[0.8*inch, 1.5*inch, 2*inch, 0.9*inch, 1.8*inch])

    # Table style
    table.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F0F0F')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 0), (-1, 0), 12),

        # Body
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#0F0F0F')),
        ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),

        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#0F0F0F')),

        # Alternating row colors
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9F9F9')]),
    ]))

    elements.append(table)

    # Footer with timestamp
    elements.append(Spacer(1, 30))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#606060'),
        alignment=TA_CENTER
    )
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    footer = Paragraph(f"Generated on {timestamp} | Skill Leveling Platform", footer_style)
    elements.append(footer)

    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
