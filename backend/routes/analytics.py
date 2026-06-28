from fastapi import APIRouter, HTTPException
from database import get_connection
from services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# 📊 1. TOTAL REVENUE (PAID vs PENDING)
@router.get("/revenue")
def get_revenue():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM total_revenue")
        row = cursor.fetchone()

        conn.close()

        if not row:
            return {"message": "No data available"}

        return {
            "paid_revenue": float(row[0]),
            "pending_revenue": float(row[1])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 📊 2. REVENUE PER DEPARTMENT
@router.get("/revenue-by-department")
def revenue_by_department():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT d.dept_name, COALESCE(SUM(b.amount), 0) AS total_revenue
            FROM DEPARTMENT d
            LEFT JOIN DOCTOR doc ON d.dept_id = doc.dept_id
            LEFT JOIN APPOINTMENT a ON doc.doctor_id = a.doctor_id
            LEFT JOIN BILLING b ON a.appointment_id = b.appointment_id AND b.payment_status = 'PAID'
            GROUP BY d.dept_name
        """)
        rows = cursor.fetchall()

        conn.close()

        return [
            {
                "department": r[0],
                "total_revenue": float(r[1] or 0)
            }
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 📊 3. APPOINTMENTS PER DOCTOR
@router.get("/appointments-per-doctor")
def appointments_per_doctor():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM doctor_workload")
        rows = cursor.fetchall()

        conn.close()

        return [
            {
                "doctor_id": r[0],
                "doctor_name": r[1],
                "total_appointments": r[2]
            }
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 📊 4. APPOINTMENTS PER DEPARTMENT
@router.get("/appointments-per-department")
def appointments_per_department():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT d.dept_name, COUNT(a.appointment_id) AS total_appointments
            FROM DEPARTMENT d
            LEFT JOIN DOCTOR doc ON d.dept_id = doc.dept_id
            LEFT JOIN APPOINTMENT a ON doc.doctor_id = a.doctor_id
            GROUP BY d.dept_name
        """)
        rows = cursor.fetchall()

        conn.close()

        return [
            {
                "department": r[0],
                "total_appointments": r[1]
            }
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 📊 5. DAILY APPOINTMENT TREND
@router.get("/daily-appointments")
def daily_appointments():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM daily_appointments")
        rows = cursor.fetchall()

        conn.close()

        return [
            {
                "date": str(r[0]),
                "total_appointments": r[1]
            }
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 📊 6. TOP MEDICATIONS
@router.get("/top-medications")
def top_medications():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM top_medications")
        rows = cursor.fetchall()

        conn.close()

        return [
            {
                "medication": r[0],
                "usage_count": r[1]
            }
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/stats")
def stats():
    return analytics_service.analytics_stats()