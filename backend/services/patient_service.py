from database import get_connection

# ✅ Register Patient
def register_patient(data):
    conn = get_connection()
    cursor = conn.cursor()

    # 🔥 Get next ID manually
    cursor.execute("SELECT patient_seq.NEXTVAL FROM dual")
    patient_id = cursor.fetchone()[0]

    # Insert using that ID
    cursor.execute("""
        INSERT INTO PATIENT
        VALUES (:1, :2, :3, :4, :5)
    """, (patient_id, data.name, data.age, data.gender, data.phone))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "patient_id": patient_id,
        "message": "Patient registered successfully"
    }

# ✅ Get Patient Appointments
def get_appointments(patient_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT appointment_id, doctor_id, appointment_date, time_slot
        FROM APPOINTMENT
        WHERE patient_id = :1
        ORDER BY appointment_date
    """, (patient_id,))

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "appointment_id": r[0],
            "doctor_id": r[1],
            "appointment_date": str(r[2]),
            "time_slot": r[3]
        }
        for r in rows
    ]
    
def search_patient(name):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT patient_id, name, age, gender, phone
        FROM PATIENT
        WHERE LOWER(name) LIKE LOWER(:1)
    """, ('%' + name + '%',))

    rows = cursor.fetchall()
    conn.close()

    return {
        "status": "success",
        "data": [
            {
                "patient_id": r[0],
                "name": r[1],
                "age": r[2],
                "gender": r[3],
                "phone": r[4]
            }
            for r in rows
        ]
    }
    
from services.admin_service import get_patient_prescriptions

def get_patient_prescriptions_service(patient_id):
    return get_patient_prescriptions(patient_id)

def get_all_patients():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT patient_id, name, age, gender, phone FROM PATIENT")
    rows = cursor.fetchall()
    conn.close()
    return [{"patient_id": r[0], "name": r[1], "age": r[2], "gender": r[3], "phone": r[4]} for r in rows]