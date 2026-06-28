--login:sqlplus clinic_user/clinic123@localhost/XEPDB1

CREATE TABLE DEPARTMENT (
    dept_id NUMBER PRIMARY KEY,
    dept_name VARCHAR2(100) UNIQUE NOT NULL,
    head_doctor_id NUMBER
);

CREATE TABLE ADMIN (
    admin_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    password VARCHAR2(100) NOT NULL
);

CREATE TABLE PATIENT (
    patient_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    age NUMBER,
    gender VARCHAR2(10),
    phone VARCHAR2(15) UNIQUE
);

CREATE TABLE MEDICATION (
    medication_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) UNIQUE NOT NULL
);

CREATE TABLE DOCTOR (
    doctor_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    specialization VARCHAR2(100),
    dept_id NUMBER NOT NULL,
    password VARCHAR2(100) NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id)
);

CREATE TABLE STAFF (
    staff_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    role VARCHAR2(50),
    dept_id NUMBER,
    FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id)
);

CREATE TABLE APPOINTMENT (
    appointment_id NUMBER PRIMARY KEY,
    patient_id NUMBER NOT NULL,
    doctor_id NUMBER NOT NULL,
    appointment_date DATE,
    time_slot VARCHAR2(20),
    FOREIGN KEY (patient_id) REFERENCES PATIENT(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES DOCTOR(doctor_id),
    UNIQUE (doctor_id, appointment_date, time_slot)
);
ALTER TABLE APPOINTMENT ADD dept_id NUMBER;
ALTER TABLE APPOINTMENT 
ADD CONSTRAINT fk_appt_dept FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id);

CREATE TABLE MEDICAL_RECORD (
    record_id NUMBER PRIMARY KEY,
    appointment_id NUMBER UNIQUE,
    symptoms VARCHAR2(500),
    diagnosis VARCHAR2(500),
    treatment VARCHAR2(500),
    FOREIGN KEY (appointment_id) REFERENCES APPOINTMENT(appointment_id)
);

CREATE TABLE PRESCRIPTION (
    prescription_id NUMBER PRIMARY KEY,
    record_id NUMBER UNIQUE,
    FOREIGN KEY (record_id) REFERENCES MEDICAL_RECORD(record_id)
);

CREATE TABLE PRESCRIPTION_MEDICATION (
    prescription_id NUMBER,
    medication_id NUMBER,
    dosage VARCHAR2(50),
    frequency VARCHAR2(50),
    duration VARCHAR2(50),
    PRIMARY KEY (prescription_id, medication_id),
    FOREIGN KEY (prescription_id) REFERENCES PRESCRIPTION(prescription_id),
    FOREIGN KEY (medication_id) REFERENCES MEDICATION(medication_id)
);

CREATE TABLE BILLING (
    bill_id NUMBER PRIMARY KEY,
    appointment_id NUMBER UNIQUE,
    amount NUMBER(10,2) CHECK (amount > 0),
    payment_mode VARCHAR2(50),
    payment_status VARCHAR2(20),
    FOREIGN KEY (appointment_id) REFERENCES APPOINTMENT(appointment_id),
    CHECK (payment_status IN ('PAID','PENDING'))
);

ALTER TABLE DEPARTMENT
ADD CONSTRAINT fk_head_doctor
FOREIGN KEY (head_doctor_id)
REFERENCES DOCTOR(doctor_id);


--adding sequences
CREATE SEQUENCE patient_seq START WITH 1000;
CREATE SEQUENCE appointment_seq START WITH 600;
CREATE SEQUENCE billing_seq START WITH 900;

/*1. DEPARTMENT
2. DOCTOR
3. UPDATE DEPARTMENT (head_doctor_id)
4. PATIENT
5. MEDICATION
6. STAFF
7. APPOINTMENT
8. MEDICAL_RECORD
9. PRESCRIPTION
10. PRESCRIPTION_MEDICATION
11. BILLING
this is the order for inserting because we dont want to mess up dependancies due to froeign keys
this is the dependancy chain Department → Doctor → Appointment → Record → Prescription → Billing
*/




-- ==========================================
-- DATABASE TRIGGERS
-- ==========================================

-- 1. Automate State Change: Assign a default doctor if none is provided
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
/

-- 2. Automate State Change: Automatically create a bill with PENDING status
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
        PENDING
    );
END;
/

-- 3. Business Rule: Prevent booking if there are unpaid bills
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
    AND b.payment_status = PENDING;

    IF unpaid_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, Pending bill exists. Cannot book new appointment.);
    END IF;
END;
/
