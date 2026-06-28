from database import get_connection

# ✅ Add Department
def add_department(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO DEPARTMENT (dept_id, dept_name)
        VALUES (:1, :2)
    """, (data.dept_id, data.dept_name))

    conn.commit()
    conn.close()

    return {"message": "Department added"}


# ✅ Add Doctor
def add_doctor(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO DOCTOR
        VALUES (:1, :2, :3, :4, :5)
    """, (
        data.doctor_id,
        data.name,
        data.specialization,
        data.dept_id,
        data.password
    ))

    conn.commit()
    conn.close()

    return {"message": "Doctor added"}


# ✅ Add Staff
def add_staff(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO STAFF
        VALUES (:1, :2, :3, :4)
    """, (
        data.staff_id,
        data.name,
        data.role,
        data.dept_id
    ))

    conn.commit()
    conn.close()

    return {"message": "Staff added"}


# ✅ Update Billing (Mark as Paid)
def update_billing(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE BILLING
        SET payment_mode = :1,
            payment_status = 'PAID'
        WHERE bill_id = :2
    """, (data.payment_mode, data.bill_id))

    conn.commit()
    conn.close()

    return {"message": "Payment updated"}

def create_billing(data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO BILLING (bill_id, appointment_id, amount, payment_status)
        VALUES (billing_seq.NEXTVAL, :1, :2, 'PENDING')
    """, (data.appointment_id, data.amount))
    conn.commit()
    conn.close()
    return {"message": "Bill generated successfully"}


# ✅ Get Patient Billing
def get_patient_billing(patient_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT b.bill_id, b.amount, b.payment_mode, b.payment_status
        FROM BILLING b
        JOIN APPOINTMENT a ON b.appointment_id = a.appointment_id
        WHERE a.patient_id = :1
    """, (patient_id,))

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "bill_id": r[0],
            "amount": float(r[1]),
            "payment_mode": r[2],
            "payment_status": r[3]
        }
        for r in rows
    ]


# ✅ Get Patient Appointments
def get_patient_appointments(patient_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT appointment_id, doctor_id, appointment_date, time_slot
        FROM APPOINTMENT
        WHERE patient_id = :1
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


# ✅ Department Details (Doctors + Staff)
def get_department_details(dept_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT doctor_id, name FROM DOCTOR
        WHERE dept_id = :1
    """, (dept_id,))
    doctors = cursor.fetchall()

    cursor.execute("""
        SELECT staff_id, name, role FROM STAFF
        WHERE dept_id = :1
    """, (dept_id,))
    staff = cursor.fetchall()

    conn.close()

    return {
        "doctors": [{"doctor_id": d[0], "name": d[1]} for d in doctors],
        "staff": [{"staff_id": s[0], "name": s[1], "role": s[2]} for s in staff]
    }


# ✅ Revenue Summary (uses view)
def get_revenue():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM total_revenue")
    row = cursor.fetchone()

    conn.close()

    return {
        "paid_revenue": float(row[0]),
        "pending_revenue": float(row[1])
    }
    
    
def get_patient_prescriptions(patient_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT pr.prescription_id, mr.record_id, m.name,
               pm.dosage, pm.frequency, pm.duration
        FROM PRESCRIPTION pr
        JOIN MEDICAL_RECORD mr ON pr.record_id = mr.record_id
        JOIN APPOINTMENT a ON mr.appointment_id = a.appointment_id
        JOIN PRESCRIPTION_MEDICATION pm ON pr.prescription_id = pm.prescription_id
        JOIN MEDICATION m ON pm.medication_id = m.medication_id
        WHERE a.patient_id = :1
    """, (patient_id,))

    rows = cursor.fetchall()
    conn.close()

    return {
        "status": "success",
        "data": [
            {
                "prescription_id": r[0],
                "record_id": r[1],
                "medication": r[2],
                "dosage": r[3],
                "frequency": r[4],
                "duration": r[5]
            }
            for r in rows
        ]
    }
    
def filter_billing(data):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT b.bill_id, b.amount, b.payment_mode, b.payment_status
        FROM BILLING b
        JOIN APPOINTMENT a ON b.appointment_id = a.appointment_id
        WHERE 1=1
    """

    params = {}

    # ✅ Add filters dynamically
    if data.patient_id is not None:
        query += " AND a.patient_id = :patient_id"
        params["patient_id"] = data.patient_id

    if data.payment_status is not None:
        query += " AND b.payment_status = :payment_status"
        params["payment_status"] = data.payment_status

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return {
        "status": "success",
        "data": [
            {
                "bill_id": r[0],
                "amount": float(r[1]),
                "payment_mode": r[2],
                "payment_status": r[3]
            }
            for r in rows
        ]
    }
    
def assign_head(dept_id, doctor_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE DEPARTMENT
        SET head_doctor_id = :1
        WHERE dept_id = :2
    """, (doctor_id, dept_id))

    conn.commit()
    conn.close()

    return {"message": "Head doctor assigned"}

def get_all_doctors():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT doctor_id, name, specialization, dept_id FROM DOCTOR")
    rows = cursor.fetchall()
    conn.close()
    return [{"doctor_id": r[0], "name": r[1], "specialization": r[2], "dept_id": r[3]} for r in rows]

def get_all_departments():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT dept_id, dept_name FROM DEPARTMENT")
    rows = cursor.fetchall()
    conn.close()
    return [{"dept_id": r[0], "dept_name": r[1]} for r in rows]

def get_all_appointments():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.appointment_id, p.name as patient_name, d.name as doctor_name, 
               dep.dept_name, a.appointment_date, a.time_slot
        FROM APPOINTMENT a
        JOIN PATIENT p ON a.patient_id = p.patient_id
        LEFT JOIN DOCTOR d ON a.doctor_id = d.doctor_id
        LEFT JOIN DEPARTMENT dep ON a.dept_id = dep.dept_id
        ORDER BY a.appointment_date DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "patient": r[1], "doctor": r[2], "dept": r[3], "date": str(r[4]), "time": r[5]} for r in rows]

def get_all_bills():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT b.bill_id, p.name as patient_name, b.amount, b.payment_mode, b.payment_status
        FROM BILLING b
        JOIN APPOINTMENT a ON b.appointment_id = a.appointment_id
        JOIN PATIENT p ON a.patient_id = p.patient_id
        ORDER BY b.bill_id DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [{"bill_id": r[0], "patient": r[1], "amount": float(r[2]), "payment_mode": r[3], "payment_status": r[4]} for r in rows]