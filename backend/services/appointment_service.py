from database import get_connection

def create_appointment(data):
    if not data.doctor_id and not data.dept_id:
        return {
            "status": "fail",
            "error": "Doctor or Department must be provided"
        }

    conn = get_connection()
    cursor = conn.cursor()

    # Automatically assign a doctor if only dept was provided
    final_doc_id = data.doctor_id
    if not final_doc_id and data.dept_id:
        cursor.execute("""
            SELECT doctor_id FROM DOCTOR 
            WHERE dept_id = :1 
            FETCH FIRST 1 ROWS ONLY
        """, (data.dept_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return {"status": "fail", "error": "No doctors available in this department"}
        final_doc_id = row[0]

    try:
        cursor.execute("""
            INSERT INTO APPOINTMENT
            (appointment_id, patient_id, doctor_id, dept_id, appointment_date, time_slot)
            VALUES (appointment_seq.NEXTVAL, :1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'), :5)
        """, (
            data.patient_id,
            final_doc_id,
            data.dept_id,
            data.appointment_date.strftime('%Y-%m-%d'),
            data.time_slot
        ))
        conn.commit()
    except Exception as e:
        error_msg = str(e)
        if "ORA-20001:" in error_msg:
            clean_msg = error_msg.split("ORA-20001:")[1].split("ORA-")[0].strip()
            raise ValueError(clean_msg)
        raise e
    finally:
        conn.close()

    return {"status": "success", "message": "Appointment booked"}

def get_booked_slots(doctor_id: int, date: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT time_slot FROM APPOINTMENT
            WHERE doctor_id = :1 AND appointment_date = TO_DATE(:2, 'YYYY-MM-DD')
        """, (doctor_id, date))
        rows = cursor.fetchall()
        return [r[0] for r in rows]
    except Exception as e:
        return []
    finally:
        conn.close()