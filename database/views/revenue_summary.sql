CREATE OR REPLACE VIEW revenue_detailed AS
SELECT 
    d.dept_name,
    b.payment_status,
    SUM(b.amount) AS total_revenue
FROM BILLING b
JOIN APPOINTMENT a ON b.appointment_id = a.appointment_id
JOIN DOCTOR doc ON a.doctor_id = doc.doctor_id
JOIN DEPARTMENT d ON doc.dept_id = d.dept_id
GROUP BY d.dept_name, b.payment_status;