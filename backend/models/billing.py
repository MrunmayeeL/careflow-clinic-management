from pydantic import BaseModel
from pydantic import Field
from typing import Optional

# 🔹 Create Billing (mostly auto via trigger, but keep for flexibility)
class BillingCreate(BaseModel):
    appointment_id: int
    amount: float

# 🔹 Billing Response (for dashboard)
class BillingResponse(BaseModel):
    bill_id: int
    appointment_id: int
    amount: float
    payment_mode: Optional[str]
    payment_status: str


# 🔹 Optional: Filter billing
class BillingFilter(BaseModel):
    patient_id: Optional[int] = None
    payment_status: Optional[str] = None
    
class BillingUpdate(BaseModel):
    bill_id: int
    payment_mode: str = Field(..., pattern="^(Cash|Card|UPI)$")