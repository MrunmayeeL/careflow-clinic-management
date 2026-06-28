CREATE OR REPLACE TRIGGER create_bill
AFTER INSERT ON APPOINTMENT
FOR EACH ROW
BEGIN
    INSERT INTO BILLING (
        bill_id,
        appointment_id,
        amount,
        payment_mode,
        payment_status
    ) VALUES (
        billing_seq.NEXTVAL,
        :NEW.appointment_id,
        500,
        NULL,
        'PENDING'
    );
END;