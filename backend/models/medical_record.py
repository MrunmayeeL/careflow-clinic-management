from pydantic import BaseModel

class MedicalRecordCreate(BaseModel):
    appointment_id: int
    symptoms: str
    diagnosis: str
    treatment: str