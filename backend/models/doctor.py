from pydantic import BaseModel
from typing import Optional

# 🔹 Doctor Login
class DoctorLogin(BaseModel):
    doctor_id: int
    password: str


# 🔹 Create Doctor (Admin will use this)
class DoctorCreate(BaseModel):
    doctor_id: int
    name: str
    specialization: str
    dept_id: int
    password: str


# 🔹 Doctor Response (for UI display)
class DoctorResponse(BaseModel):
    doctor_id: int
    name: str
    specialization: str
    dept_id: int


# 🔹 Optional: Update Doctor
class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    dept_id: Optional[int] = None