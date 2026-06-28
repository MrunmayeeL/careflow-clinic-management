from fastapi import APIRouter
from utils.auth import admin_login
from services import admin_service
from models.admin import AdminLogin  # (you should create this)
from models.admin import DepartmentCreate

router = APIRouter(prefix="/admin")

# 🔐 LOGIN (from auth.py)
@router.post("/login")
def login(data: AdminLogin):
    return admin_login(data.admin_id, data.password)


# 💰 VIEW PATIENT BILLING
@router.get("/patients/{id}/billing")
def get_billing(id: int):
    return admin_service.get_patient_billing(id)


# 📅 VIEW PATIENT APPOINTMENTS
@router.get("/patients/{id}/appointments")
def get_appointments(id: int):
    return admin_service.get_patient_appointments(id)

 

# 👩‍⚕️ ADD STAFF
from models.staff import StaffCreate

@router.post("/staff")
def add_staff(data: StaffCreate):
    return admin_service.add_staff(data)


from models.billing import BillingFilter, BillingUpdate, BillingCreate

@router.post("/billing")
def create_billing(data: BillingCreate):
    return admin_service.create_billing(data)

# 💳 UPDATE BILLING
@router.put("/billing")
def update_billing(data: BillingUpdate):
    return admin_service.update_billing(data)


# 📊 REVENUE REPORT
@router.get("/revenue")
def revenue():
    return admin_service.get_revenue()


# 🏢 DEPARTMENT DETAILS
@router.get("/departments/{id}")
def dept_details(id: int):
    return admin_service.get_department_details(id)

@router.get("/patients/{id}/prescriptions")
def get_prescriptions(id: int):
    return admin_service.get_patient_prescriptions(id)

from models.billing import BillingFilter

@router.post("/billing/filter")
def filter_billing(data: BillingFilter):
    return admin_service.filter_billing(data)

@router.post("/departments")
def add_department(data: DepartmentCreate):
    return admin_service.add_department(data)

@router.put("/departments/head")
def assign_head(dept_id: int, doctor_id: int):
    return admin_service.assign_head(dept_id, doctor_id)


from models.doctor import DoctorCreate

@router.post("/doctors")
def add_doctor(data: DoctorCreate):
    return admin_service.add_doctor(data)

@router.get("/all/doctors")
def get_all_doctors():
    return admin_service.get_all_doctors()

@router.get("/all/departments")
def get_all_departments():
    return admin_service.get_all_departments()

@router.get("/all/appointments")
def get_all_appointments():
    return admin_service.get_all_appointments()

@router.get("/all/bills")
def get_all_bills():
    return admin_service.get_all_bills()
