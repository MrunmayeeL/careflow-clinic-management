import oracledb

try:
    conn = oracledb.connect(
        user="clinic_user",
        password="clinic123",
        dsn="localhost:1521/XEPDB1"
    )
    
    print("✅ Connected to Oracle DB")

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM PATIENT")

    for row in cursor:
        print(row)

    conn.close()

except Exception as e:
    print("❌ Error:", e)