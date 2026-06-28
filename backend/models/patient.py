from pydantic import BaseModel

class PatientRegister(BaseModel):
    name: str
    age: int
    gender: str
    phone: str
    
class PatientLogin(BaseModel):
    patient_id: int