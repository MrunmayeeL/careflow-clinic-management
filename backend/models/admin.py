from pydantic import BaseModel

class AdminLogin(BaseModel):
    admin_id: int
    password: str
    
class DepartmentCreate(BaseModel):
    dept_id: int
    dept_name: str
    
