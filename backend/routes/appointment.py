from fastapi import APIRouter
from models.appointment import AppointmentCreate
from services import appointment_service

router = APIRouter(prefix="/appointments")

from fastapi import HTTPException

@router.post("/")
def create_appointment(data: AppointmentCreate):
    try:
        return appointment_service.create_appointment(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/booked-slots")
def get_booked_slots(doctor_id: int, date: str):
    return appointment_service.get_booked_slots(doctor_id, date)