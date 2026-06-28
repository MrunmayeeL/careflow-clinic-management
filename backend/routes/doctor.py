from fastapi import APIRouter, HTTPException
from utils.auth import doctor_login
from services import doctor_service


# ✅ Import models (IMPORTANT)
from models.doctor import DoctorLogin
from models.medical_record import MedicalRecordCreate
from models.prescription import PrescriptionCreate

router = APIRouter(prefix="/doctor", tags=["Doctor"])


# 🔐 1. LOGIN
@router.post("/login")
def login(data: DoctorLogin):
    result = doctor_login(data.doctor_id, data.password)

    if result.get("status") != "success":
        raise HTTPException(status_code=401, detail=result["error"])

    return result


# 📜 2. VIEW PATIENT MEDICAL HISTORY
@router.get("/patients/{patient_id}/records")
def get_records(patient_id: int):
    records = doctor_service.get_patient_records(patient_id)

    if not records:
        return {"message": "No records found"}

    # Optional: convert to clean JSON
    return [
        {
            "record_id": r[0],
            "symptoms": r[1],
            "diagnosis": r[2],
            "treatment": r[3],
            "appointment_date": str(r[4]),
            "time_slot": r[5]
        }
        for r in records
    ]


# 🧾 3. ADD MEDICAL RECORD
@router.post("/medical-record")
def add_record(data: MedicalRecordCreate):
    try:
        return doctor_service.add_medical_record(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# 💊 4. ADD PRESCRIPTION
@router.post("/prescription")
def add_prescription(data: PrescriptionCreate):
    try:
        return doctor_service.add_prescription(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    
@router.get("/patients/{patient_id}/prescriptions")
def get_prescriptions(patient_id: int):
    return doctor_service.get_patient_prescriptions(patient_id)

@router.get("/{doctor_id}/schedule")
def get_schedule(doctor_id: int):
    return doctor_service.get_doctor_schedule(doctor_id)
