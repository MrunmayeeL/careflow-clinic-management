import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, UserCheck, TrendingUp, Activity, Users, Building, X, CreditCard, PlusCircle } from "lucide-react";

const COLORS = ['#84b6f4', '#fdcab5', '#b5ead7', '#ffb7b2', '#e2f0cb'];

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";

  const [revenue, setRevenue] = useState({ paid_revenue: 0, pending_revenue: 0 });
  const [revByDept, setRevByDept] = useState([]);
  const [appByDept, setAppByDept] = useState([]);

  // Stats State
  const [patientsCount, setPatientsCount] = useState(0);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [deptsCount, setDeptsCount] = useState(0);

  // Data Arrays
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('STAFF'); // STAFF, DOCTOR, DEPT, BILL
  
  // Form State
  const [name, setName] = useState('');
  const [specOrRole, setSpecOrRole] = useState('');
  const [deptId, setDeptId] = useState('');
  const [passOrId, setPassOrId] = useState(''); // password for doc, staff_id for staff, id for dept
  const [docId, setDocId] = useState('');
  
  // Bill Gen State
  const [genAppId, setGenAppId] = useState('');
  const [genAmount, setGenAmount] = useState('');

  const fetchData = () => {
     if (tab === "overview") {
        API.get("/analytics/revenue").then(res => setRevenue(res.data)).catch(console.error);
        API.get("/analytics/revenue-by-department").then(res => setRevByDept(res.data)).catch(console.error);
        API.get("/analytics/appointments-per-department").then(res => setAppByDept(res.data)).catch(console.error);
        
        API.get("/patients/all/patients").then(res => setPatientsCount(res.data.length)).catch(console.error);
        API.get("/admin/all/doctors").then(res => setDoctorsCount(res.data.length)).catch(console.error);
        API.get("/admin/all/departments").then(res => setDeptsCount(res.data.length)).catch(console.error);
      }
      if (tab === "appointments") {
        API.get("/admin/all/appointments").then(res => setAppointments(res.data)).catch(console.error);
      }
      if (tab === "billing") {
        API.get("/admin/all/bills").then(res => setBills(res.data)).catch(console.error);
      }
      if (tab === "staff") {
        API.get("/admin/all/departments").then(res => setDepartments(res.data)).catch(console.error);
        API.get("/admin/all/doctors").then(res => setAllDoctors(res.data)).catch(console.error);
      }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       if (modalType === 'DOCTOR') {
           await API.post("/admin/doctors", {
                doctor_id: Number(docId),
                name,
                specialization: specOrRole,
                dept_id: Number(deptId),
                password: passOrId
           });
           alert("Doctor Added Successfully!");
       } else if (modalType === 'STAFF') {
           await API.post("/admin/staff", {
                staff_id: Number(passOrId),
                name,
                role: specOrRole,
                dept_id: Number(deptId)
           });
           alert("Staff Added Successfully!");
       } else if (modalType === 'DEPT') {
           await API.post("/admin/departments", {
                dept_id: Number(passOrId),
                dept_name: name
           });
           alert("Department Added Successfully!");
       } else if (modalType === 'BILL') {
           await API.post("/admin/billing", {
                appointment_id: Number(genAppId),
                amount: Number(genAmount)
           });
           alert("Bill Generated Successfully!");
       }
       setShowModal(false);
       setName(''); setSpecOrRole(''); setDeptId(''); setPassOrId(''); setDocId(''); setGenAppId(''); setGenAmount('');
       fetchData(); // reload stats
    } catch (err) {
       const d = err.response?.data?.detail;
       alert(typeof d === 'object' ? JSON.stringify(d) : (d || "Error processing request"));
    }
  };

  const handleUpdateBilling = async (bill_id, mode) => {
     try {
       await API.put("/admin/billing", {
           bill_id: bill_id,
           payment_mode: mode
       });
       alert("Bill Marked as PAID Successfully!");
       fetchData();
     } catch (e) {
       const d = e.response?.data?.detail;
       alert(typeof d === 'object' ? JSON.stringify(d) : (d || "Error updating bill"));
     }
  }

  const handleAssignHod = async (d_id, doc_id) => {
      try {
          await API.put(`/admin/departments/head?dept_id=${d_id}&doctor_id=${doc_id}`);
          alert("HOD Assigned!");
      } catch(e) {
          alert("Error assigning HOD");
      }
  }

  if (tab === "overview") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2>System Overview</h2>
        
        {/* ... Metric Cards Row 1 ... */}
        <div className="grid-cols-3">
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--success)', borderRadius: '12px', color: '#2d3748' }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Total Patients</p>
              <h3 style={{ margin: 0 }}>{patientsCount}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--warning)', borderRadius: '12px', color: '#2d3748' }}>
              <UserCheck size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Active Doctors</p>
              <h3 style={{ margin: 0 }}>{doctorsCount}</h3>
            </div>
          </div>
          
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--primary)', borderRadius: '12px', color: 'white' }}>
              <Building size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Departments</p>
              <h3 style={{ margin: 0 }}>{deptsCount}</h3>
            </div>
          </div>
        </div>

        {/* ... Metric Cards Row 2 (Revenue) ... */}
        <div className="grid-cols-3">
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--accent)', borderRadius: '12px', color: '#2d3748' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Paid Revenue</p>
              <h3 style={{ margin: 0 }}>${revenue.paid_revenue?.toLocaleString() || 0}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--danger)', borderRadius: '12px', color: '#2d3748' }}>
              <Activity size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Pending Bills</p>
              <h3 style={{ margin: 0 }}>${revenue.pending_revenue?.toLocaleString() || 0}</h3>
            </div>
          </div>
          
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', color: '#2d3748' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Total Billed</p>
              <h3 style={{ margin: 0 }}>${((revenue.paid_revenue || 0) + (revenue.pending_revenue || 0)).toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid-cols-2">
          {/* Revenue By Department */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '24px' }}>Revenue by Department</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={revByDept}
                    dataKey="total_revenue"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {revByDept.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Appointments By Department */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '24px' }}>Appointments by Department</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={appByDept}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="total_appointments" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (tab === "appointments") {
      return (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>All Appointments (Clinic Wide)</h3>
              <button className="btn btn-primary" onClick={() => { setModalType('BILL'); setShowModal(true); }}>
                  + Generate Bill
              </button>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Apt ID</th>
                    <th>Patient Name</th>
                    <th>Doctor Name</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((app) => (
                    <tr key={app.id}>
                      <td>{app.id}</td>
                      <td>{app.patient}</td>
                      <td>{app.doctor || '-'}</td>
                      <td>{app.dept || '-'}</td>
                      <td>{app.date.substring(0, 10)}</td>
                      <td>{app.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Modal for Bill Gen */}
            {showModal && modalType === 'BILL' && (
               <div style={{ 
                   position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                   background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 
               }}>
                  <div className="glass-card" style={{ width: '400px', background: 'var(--bg-color)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3>Generate Bill</h3>
                        <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                           <X size={24} />
                        </button>
                     </div>
                     <form onSubmit={handleSubmit}>
                        <div className="input-group">
                           <label>Appointment ID</label>
                           <input type="number" value={genAppId} onChange={e => setGenAppId(e.target.value)} required />
                        </div>
                        <div className="input-group" style={{ marginBottom: '24px' }}>
                           <label>Amount (USD)</label>
                           <input type="number" value={genAmount} onChange={e => setGenAmount(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Bill</button>
                     </form>
                  </div>
               </div>
            )}
            
          </div>
      );
  }

  if (tab === "billing") {
      return (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Clinic Billing Management</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Patient</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.bill_id}>
                      <td>{bill.bill_id}</td>
                      <td>{bill.patient}</td>
                      <td>${bill.amount.toLocaleString()}</td>
                      <td>
                         {bill.payment_status === 'PAID' ? 
                           <span className="badge badge-success">PAID via {bill.payment_mode}</span> :
                           <span className="badge badge-danger">PENDING</span>
                         }
                      </td>
                      <td>
                         {bill.payment_status !== 'PAID' && (
                             <div style={{ display: 'flex', gap: '8px' }}>
                                 <button onClick={() => handleUpdateBilling(bill.bill_id, 'Card')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>Paid by Card</button>
                                 <button onClick={() => handleUpdateBilling(bill.bill_id, 'Cash')} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }}>Paid by Cash</button>
                             </div>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      );
  }

  if (tab === "staff") {
    return (
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Manage Clinic Entities</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button className="btn btn-outline" onClick={() => { setModalType('DEPT'); setShowModal(true); }}>
               + Add Dept
            </button>
            <button className="btn btn-secondary" onClick={() => { setModalType('STAFF'); setShowModal(true); }}>
               + Add Staff
            </button>
            <button className="btn btn-primary" onClick={() => { setModalType('DOCTOR'); setShowModal(true); }}>
               + Add Doctor
            </button>
          </div>
        </div>
        
        {/* Departments List in Staff Tab */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Departments Overview & HOD Assigning</h3>
          <div className="table-container">
             <table>
                <thead>
                  <tr>
                    <th>Dept ID</th>
                    <th>Department Name</th>
                    <th>Assign HOD</th>
                  </tr>
                </thead>
                <tbody>
                   {departments.map((d) => (
                      <tr key={d.dept_id}>
                         <td>{d.dept_id}</td>
                         <td>{d.dept_name}</td>
                         <td>
                            <select 
                               style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }}
                               onChange={(e) => handleAssignHod(d.dept_id, e.target.value)}
                            >
                               <option value="">-- Select a Doctor to make HOD --</option>
                               {allDoctors.filter(doc => doc.dept_id === d.dept_id).map(doc => (
                                  <option key={doc.doctor_id} value={doc.doctor_id}>Dr. {doc.name}</option>
                               ))}
                            </select>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* Modal Overlay Multi-form */}
        {showModal && modalType !== 'BILL' && (
           <div style={{ 
               position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
               background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 
           }}>
              <div className="glass-card" style={{ width: '400px', background: 'var(--bg-color)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3>Add {modalType === 'DOCTOR' ? 'Doctor' : modalType === 'STAFF' ? 'Staff' : 'Department'}</h3>
                    <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
                       <X size={24} />
                    </button>
                 </div>
                 
                 <form onSubmit={handleSubmit}>
                    {modalType === 'DEPT' ? (
                       <>
                          <div className="input-group">
                             <label>Department ID</label>
                             <input type="number" value={passOrId} onChange={e => setPassOrId(e.target.value)} required />
                          </div>
                          <div className="input-group" style={{ marginBottom: '24px' }}>
                             <label>Department Name</label>
                             <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                          </div>
                       </>
                    ) : (
                       <>
                          {modalType === 'DOCTOR' && (
                              <div className="input-group">
                                <label>Doctor ID</label>
                                <input type="number" value={docId} onChange={e => setDocId(e.target.value)} required />
                              </div>
                          )}
                          <div className="input-group">
                            <label>Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                          </div>
                          <div className="input-group">
                            <label>{modalType === 'DOCTOR' ? 'Specialization' : 'Role'}</label>
                            <input type="text" value={specOrRole} onChange={e => setSpecOrRole(e.target.value)} required />
                          </div>
                          <div className="input-group">
                            <label>Department ID</label>
                            <input type="number" value={deptId} onChange={e => setDeptId(e.target.value)} required />
                          </div>
                          <div className="input-group" style={{ marginBottom: '24px' }}>
                            <label>{modalType === 'DOCTOR' ? 'Login Password' : 'Staff ID'}</label>
                            <input type={modalType === 'DOCTOR' ? "password" : "number"} value={passOrId} onChange={e => setPassOrId(e.target.value)} required />
                          </div>
                       </>
                    )}
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                       Register {modalType === 'DOCTOR' ? 'Doctor' : modalType === 'STAFF' ? 'Staff' : 'Department'}
                    </button>
                 </form>
              </div>
           </div>
        )}
      </div>
    );
  }

  return <div>Tab not found</div>;
}