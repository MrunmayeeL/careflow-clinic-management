CREATE OR REPLACE TRIGGER assign_doctor
BEFORE INSERT ON APPOINTMENT
FOR EACH ROW
BEGIN
    IF :NEW.doctor_id IS NULL THEN
        SELECT doctor_id INTO :NEW.doctor_id
        FROM DOCTOR
        WHERE dept_id = :NEW.dept_id
        AND ROWNUM = 1;
    END IF;
END;