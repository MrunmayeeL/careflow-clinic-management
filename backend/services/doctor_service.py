from database import get_connection

# ✅ View Patient Records
def get_patient_records(patient_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT mr.record_id, mr.symptoms, mr.diagnosis, mr.treatment,
               a.appointment_date, a.time_slot
        FROM MEDICAL_RECORD mr
        JOIN APPOINTMENT a ON mr.appointment_id = a.appointment_id
        WHERE a.patient_id = :1
    """, (patient_id,))

    rows = cursor.fetchall()
    conn.close()

    return rows


# ✅ Add Medical Record
def add_medical_record(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO MEDICAL_RECORD
    (record_id, appointment_id, symptoms, diagnosis, treatment)
    VALUES (record_seq.NEXTVAL, :1, :2, :3, :4)
""", (
    data.appointment_id,
    data.symptoms,
    data.diagnosis,
    data.treatment
))

    conn.commit()
    conn.close()

    return {"message": "Medical record added"}


# ✅ Add Prescription
def add_prescription(data):
    conn = get_connection()
    cursor = conn.cursor()

    # Insert prescription
    cursor.execute("""
    INSERT INTO PRESCRIPTION (prescription_id, record_id)
    VALUES (prescription_seq.NEXTVAL, :1)
""", (data.record_id,))
    
    # Insert medications
    for med in data.medications:
        cursor.execute("""
            INSERT INTO PRESCRIPTION_MEDICATION
            VALUES (:1, :2, :3, :4, :5)
        """, (
            data.prescription_id,
            med.medication_id,
            med.dosage,
            med.frequency,
            med.duration
        ))

    conn.commit()
    conn.close()

    return {"message": "Prescription added"}

from services.admin_service import get_patient_prescriptions as admin_get_patient_prescriptions

def get_patient_prescriptions(patient_id):
    return admin_get_patient_prescriptions(patient_id)

def get_doctor_schedule(doctor_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.appointment_id, p.name, a.appointment_date, a.time_slot
        FROM APPOINTMENT a
        JOIN PATIENT p ON a.patient_id = p.patient_id
        WHERE a.doctor_id = :1
        ORDER BY a.appointment_date, a.time_slot
    """, (doctor_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"appointment_id": r[0], "patient_name": r[1], "date": str(r[2]), "time": r[3]} for r in rows]