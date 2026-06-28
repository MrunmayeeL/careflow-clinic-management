from pydantic import BaseModel
from typing import List

class MedicationItem(BaseModel):
    medication_id: int
    dosage: str
    frequency: str
    duration: str

class PrescriptionCreate(BaseModel):
    record_id: int
    medications: List[MedicationItem]