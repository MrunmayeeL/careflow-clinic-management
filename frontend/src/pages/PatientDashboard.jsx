import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { Calendar, PlusCircle, Pill } from "lucide-react";

const ALL_TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];

export default function PatientDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  // Booking Form State
  const [doctorId, setDoctorId] = useState("");
  const [deptId, setDeptId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  useEffect(() => {
    if (!user) return;
    
    if (tab === "overview" || tab === "appointments") {
      API.get(`/patients/${user.id}/appointments`)
         .then(res => setAppointments(res.data))
         .catch(console.error);
         
      API.get("/admin/all/doctors").then(res => setDoctors(res.data)).catch(console.error);
      API.get("/admin/all/departments").then(res => setDepartments(res.data)).catch(console.error);
    }
    if (tab === "prescriptions") {
      API.get(`/patients/${user.id}/prescriptions`)
         .then(res => setPrescriptions(res.data.data || res.data))
         .catch(console.error);
    }
  }, [tab, user]);

  useEffect(() => {
    if (doctorId && appointmentDate) {
       API.get(`/appointments/booked-slots?doctor_id=${doctorId}&date=${appointmentDate}`)
          .then(res => setBookedSlots(res.data))
          .catch(e => setBookedSlots([]));
    } else {
       setBookedSlots([]);
    }
  }, [doctorId, appointmentDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!timeSlot) return alert("Select a time slot");
    try {
      await API.post("/appointments/", {
        patient_id: user.id,
        doctor_id: doctorId ? Number(doctorId) : null,
        dept_id: deptId ? Number(deptId) : null,
        appointment_date: appointmentDate,
        time_slot: timeSlot
      });
      alert("Appointment booked successfully!");
      // Reset & Refresh
      setTimeSlot("");
      API.get(`/patients/${user.id}/appointments`).then(res => setAppointments(res.data));
      // Refresh booked slots list so new one is greyed out
      if(doctorId) {
          API.get(`/appointments/booked-slots?doctor_id=${doctorId}&date=${appointmentDate}`)
              .then(res => setBookedSlots(res.data));
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Error booking appointment");
    }
  };

  const getAvailableSlots = () => {
    if (!appointmentDate || (!doctorId && !deptId)) return [];
    if (!doctorId && deptId) return ALL_TIME_SLOTS;
    return ALL_TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
  }

  if (tab === "overview") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2>Welcome to your Dashboard</h2>
        <div className="grid-cols-2">
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--primary)', borderRadius: '12px', color: 'white' }}>
              <Calendar size={28} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Upcoming Appointments</p>
              <h3 style={{ margin: 0 }}>{appointments.length}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--accent)', borderRadius: '12px', color: '#2d3748' }}>
              <Pill size={28} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Active Prescriptions</p>
              <h3 style={{ margin: 0 }}>View in Prescriptions Tab</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "appointments") {
    const availableSlots = getAvailableSlots();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Book Appointment Form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <PlusCircle color="var(--primary)" /> Book New Appointment
          </h3>
          <form onSubmit={handleBook} className="grid-cols-2" style={{ alignItems: 'end' }}>
            <div className="input-group">
              <label>Doctor (Optional if Dept is selected)</label>
              <select value={doctorId} onChange={e => { setDoctorId(e.target.value); setDeptId(""); setTimeSlot(""); }}>
                <option value="">-- Select a Doctor --</option>
                {doctors.map(d => (
                  <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.name} ({d.specialization})</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Department (Optional if Doctor is selected)</label>
              <select value={deptId} onChange={e => { setDeptId(e.target.value); setDoctorId(""); setTimeSlot(""); }}>
                <option value="">-- Select a Department --</option>
                {departments.map(d => (
                   <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Date</label>
              <input type="date" value={appointmentDate} onChange={e => {setAppointmentDate(e.target.value); setTimeSlot("");}} required />
            </div>
            <div className="input-group">
              <label>Time Slot</label>
              <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} disabled={(!doctorId && !deptId) || !appointmentDate}>
                <option value="">-- {((!doctorId && !deptId) || !appointmentDate) ? "Select Date & Doc/Dept First" : "Select Available Slot"} --</option>
                {availableSlots.map(slot => (
                   <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px' }} disabled={!doctorId && !deptId}>
                Book Appointment
              </button>
            </div>
          </form>
        </div>

        {/* Appointments List */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>My Appointments</h3>
          {appointments.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px' }}>No appointments found.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Doctor ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((app, i) => (
                    <tr key={i}>
                      <td>{app[0] || app.appointment_id || '-'}</td>
                      <td>{app[2] || app.doctor_id || '-'}</td>
                      <td>{String(app[3] || app.appointment_date || '').substring(0, 10)}</td>
                      <td>{app[4] || app.time_slot || '-'}</td>
                      <td><span className="badge badge-success">Confirmed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (tab === "prescriptions") {
    let scripts = Array.isArray(prescriptions) ? prescriptions : [];
    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>My Prescriptions</h3>
        {scripts.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '24px' }}>No scripts found.</p>
        ) : (
          <div className="grid-cols-2">
            {scripts.map((p, i) => (
              <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Prescription #{p.prescription_id || p[0]}</strong>
                  <span className="badge badge-warning">Active</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>For Record: #{p.record_id || p[1]}</p>
                <div style={{ background: 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '8px', fontSize: '0.875rem' }}>
                   <strong>Medication:</strong> {p.medication} <br/>
                   <strong>Dosage:</strong> {p.dosage} <br/>
                   <strong>Frequency:</strong> {p.frequency} <br/>
                   <strong>Duration:</strong> {p.duration}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <div>Tab not found</div>;
}