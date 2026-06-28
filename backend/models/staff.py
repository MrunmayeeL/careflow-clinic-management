from pydantic import BaseModel

class StaffCreate(BaseModel):
    staff_id: int
    name: str
    role: str
    dept_id: int