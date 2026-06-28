CREATE OR REPLACE TRIGGER check_unpaid_bill
BEFORE INSERT ON APPOINTMENT
FOR EACH ROW
DECLARE
    unpaid_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO unpaid_count
    FROM BILLING b
    JOIN APPOINTMENT a ON b.appointment_id = a.appointment_id
    WHERE a.patient_id = :NEW.patient_id
    AND b.payment_status = 'PENDING';

    IF unpaid_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Pending bill exists. Cannot book new appointment.');
    END IF;
END;