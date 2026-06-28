from pydantic import BaseModel, model_validator
from typing import Optional
from datetime import date


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: Optional[int] = None
    dept_id: Optional[int] = None
    appointment_date: date
    time_slot: str

    @model_validator(mode="after")
    def check_doctor_or_dept(self):
        if not self.doctor_id and not self.dept_id:
            raise ValueError("Either doctor_id or dept_id must be provided")
        return self
    
class AppointmentResponse(BaseModel):
    appointment_id: int
    doctor_id: int
    appointment_date: str
    time_slot: str