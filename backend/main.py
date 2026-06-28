from fastapi import FastAPI
from routes import patient, doctor, admin, appointment, analytics
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(patient.router)
app.include_router(doctor.router)
app.include_router(admin.router)
app.include_router(appointment.router)
app.include_router(analytics.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)