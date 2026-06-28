from database import get_connection

# 🔐 Generic authentication function
def authenticate_user(table, user_id_field, password_field, user_id, password):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = f"""
            SELECT * FROM {table}
            WHERE {user_id_field} = :1 AND {password_field} = :2
        """

        cursor.execute(query, (user_id, password))
        user = cursor.fetchone()

        conn.close()

        return user is not None

    except Exception as e:
        return {"status": "error", "message": str(e)}


# 👤 Patient Login (ID-based)
def patient_login(patient_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM PATIENT
            WHERE patient_id = :1
        """, (patient_id,))

        user = cursor.fetchone()
        conn.close()

        if user:
            return {"status": "success", "role": "PATIENT"}
        return {"status": "fail", "error": "Patient not found"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


# 👨‍⚕️ Doctor Login
def doctor_login(doctor_id, password):
    result = authenticate_user(
        "DOCTOR", "doctor_id", "password",
        doctor_id, password
    )

    if isinstance(result, dict):  # error case
        return result

    if result:
        return {"status": "success", "role": "DOCTOR"}
    return {"status": "fail", "error": "Invalid credentials"}


# 🧑‍💼 Admin Login
def admin_login(admin_id, password):
    result = authenticate_user(
        "ADMIN", "admin_id", "password",
        admin_id, password
    )

    if isinstance(result, dict):
        return result

    if result:
        return {"status": "success", "role": "ADMIN"}
    return {"status": "fail", "error": "Invalid credentials"}