import sys
sys.path.insert(0, ".")
from app.modules.slots.schemas import SlotAdminResponse
from datetime import datetime
try:
    print(SlotAdminResponse.model_fields)
    s = SlotAdminResponse(id=1, start_time=datetime.now(), end_time=datetime.now(), booking_cutoff=datetime.now(), status="DRAFT")
    print("Success!", s)
except Exception as e:
    print("Error:", e)
