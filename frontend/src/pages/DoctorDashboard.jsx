import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { Stethoscope, Search, FileSymlink, Plus, Calendar } from "lucide-react";

export default function DoctorDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const { user } = useAuth();

  // Patients State
  const [allPatients, setAllPatients] = useState([]);
  const [schedule, setSchedule] = useState([]);

  // Patient Lookup State
  const [searchPatientId, setSearchPatientId] = useState("");
  const [patientRecords, setPatientRecords] = useState([]);

  // Medical Record Form State
  const [appointmentId, setAppointmentId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");

  useEffect(() => {
     if (!user) return;
     if (tab === "patients") {
        API.get("/patients/all/patients")
           .then(res => setAllPatients(res.data))
           .catch(console.error);
     }
     if (tab === "overview") {
        API.get(`/doctor/${user.id}/schedule`)
           .then(res => setSchedule(res.data))
           .catch(console.error);
     }
  }, [tab, user]);

  const handleSearchPatient = async (e) => {
    e.preventDefault();
    if (!searchPatientId) return;
    try {
      const res = await API.get(`/doctor/patients/${searchPatientId}/records`);
      if (res.data.message) {
        setPatientRecords([]);
        alert(res.data.message);
      } else {
        setPatientRecords(res.data);
      }
    } catch (err) {
      alert("Error fetching records");
      console.error(err);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      await API.post("/doctor/medical-record", {
        appointment_id: Number(appointmentId),
        symptoms,
        diagnosis,
        treatment
      });
      alert("Medical Record Added!");
      setAppointmentId("");
      setSymptoms("");
      setDiagnosis("");
      setTreatment("");
    } catch (err) {
      alert(err.response?.data?.detail || "Error adding record");
    }
  };

  if (tab === "overview") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2>Good Day, Doctor!</h2>
        
        <div className="grid-cols-2">
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--primary)', borderRadius: '12px', color: 'white' }}>
              <Calendar size={28} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Upcoming Appointments</p>
              <h3 style={{ margin: 0 }}>{schedule.length} limits</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Your Schedule</h3>
          {schedule.length === 0 ? (
             <p>No appointments scheduled.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Apt ID</th>
                    <th>Patient Name</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map(s => (
                    <tr key={s.appointment_id}>
                      <td>{s.appointment_id}</td>
                      <td>{s.patient_name}</td>
                      <td>{s.date.substring(0, 10)}</td>
                      <td><span className="badge badge-warning">{s.time}</span></td>
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

  if (tab === "patients") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Search color="var(--primary)" /> Patient History Lookup
          </h3>
          <form onSubmit={handleSearchPatient} style={{ display: 'flex', gap: '16px', alignItems: 'end', marginBottom: '24px' }}>
            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Select Patient</label>
              <select value={searchPatientId} onChange={e => setSearchPatientId(e.target.value)} required>
                  <option value="">-- Choose Patient --</option>
                  {allPatients.map(p => (
                     <option key={p.patient_id} value={p.patient_id}>ID: {p.patient_id} - {p.name}</option>
                  ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Lookup Records</button>
          </form>

          {patientRecords.length > 0 && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Date</th>
                    <th>Symptoms</th>
                    <th>Diagnosis</th>
                    <th>Treatment</th>
                  </tr>
                </thead>
                <tbody>
                  {patientRecords.map((r, i) => (
                    <tr key={i}>
                      <td>{r.record_id || r[0]}</td>
                      <td>{String(r.appointment_date || r[4] || '').substring(0, 10)}</td>
                      <td>{r.symptoms || r[1]}</td>
                      <td>{r.diagnosis || r[2]}</td>
                      <td>{r.treatment || r[3]}</td>
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

  if (tab === "records") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <FileSymlink color="var(--primary)" /> Add Medical Record
          </h3>
          <form onSubmit={handleAddRecord} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Appointment ID</label>
              <input type="number" value={appointmentId} onChange={e => setAppointmentId(e.target.value)} required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Symptoms</label>
              <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Diagnosis</label>
              <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Treatment</label>
              <input type="text" value={treatment} onChange={e => setTreatment(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              <Plus size={18} /> Save Medical Record
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <div>Tab not found</div>;
}