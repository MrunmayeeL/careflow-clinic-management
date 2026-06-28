CREATE OR REPLACE VIEW appointments_per_department AS
SELECT 
    d.dept_name,
    COUNT(*) AS total_appointments
FROM APPOINTMENT a
JOIN DOCTOR doc ON a.doctor_id = doc.doctor_id
JOIN DEPARTMENT d ON doc.dept_id = d.dept_id
GROUP BY d.dept_name;