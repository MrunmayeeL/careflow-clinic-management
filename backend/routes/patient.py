from fastapi import APIRouter
from models.patient import PatientRegister
from services import patient_service
from utils.auth import patient_login
from models.patient import PatientLogin


router = APIRouter(prefix="/patients")

@router.post("/login")
def login(data: PatientLogin):
    return patient_login(data.patient_id)

@router.post("/register")
def register_patient(data: PatientRegister):
    return patient_service.register_patient(data)

@router.get("/{patient_id}/appointments")
def get_appointments(patient_id: int):
    return patient_service.get_appointments(patient_id)

@router.get("/search")
def search_patient(name: str):
    return patient_service.search_patient(name)


@router.get("/{patient_id}/prescriptions")
def get_prescriptions(patient_id: int):
    return patient_service.get_patient_prescriptions_service(patient_id)

@router.get("/all/patients")
def get_all_patients():
    return patient_service.get_all_patients()
