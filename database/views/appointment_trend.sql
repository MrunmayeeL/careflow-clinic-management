CREATE OR REPLACE VIEW daily_appointments AS
SELECT 
    appointment_date,
    COUNT(*) AS total_appointments
FROM APPOINTMENT
GROUP BY appointment_date
ORDER BY appointment_date;