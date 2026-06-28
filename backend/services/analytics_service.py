from database import get_connection

def analytics_stats():
    conn = get_connection()
    cursor = conn.cursor()

    # Total patients
    cursor.execute("SELECT COUNT(*) FROM PATIENT")
    patients = cursor.fetchone()[0]

    # Total revenue
    cursor.execute("SELECT SUM(amount) FROM BILLING WHERE payment_status='PAID'")
    revenue = cursor.fetchone()[0] or 0

    # Pending bills
    cursor.execute("SELECT COUNT(*) FROM BILLING WHERE payment_status='PENDING'")
    pending = cursor.fetchone()[0]

    conn.close()

    return {
        "status": "success",
        "data": {
            "total_patients": patients,
            "total_revenue": float(revenue),
            "pending_bills": pending
        }
    }