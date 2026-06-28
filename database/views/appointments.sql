CREATE VIEW appointments_per_doctor AS
SELECT doctor_id, COUNT(*) total
FROM APPOINTMENT
GROUP BY doctor_id;