import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { User, Lock, HeartPulse, LogIn, UserPlus } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login State
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");
  
  // Register State (Patient Only)
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("M");
  const [phone, setPhone] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      let endpoint = "";
      let payload = {};

      if (role === "PATIENT") {
        if (!id) return alert("Please enter Patient ID");
        endpoint = "/patients/login";
        payload = { patient_id: Number(id) };
      } else if (role === "DOCTOR") {
        if (!id || !password) return alert("Please enter Doctor ID and Password");
        endpoint = "/doctor/login";
        payload = { doctor_id: Number(id), password };
      } else if (role === "ADMIN") {
        if (!id || !password) return alert("Please enter Admin ID and Password");
        endpoint = "/admin/login";
        payload = { admin_id: Number(id), password };
      }

      const res = await API.post(endpoint, payload);
      const data = res.data;
      
      login({ ...data, id, role });

      if (role === "PATIENT") navigate("/patient");
      else if (role === "DOCTOR") navigate("/doctor");
      else if (role === "ADMIN") navigate("/admin");
    } catch (err) {
      console.log("ERROR:", err.response);
      alert(err.response?.data?.detail || err.response?.data?.error || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        age: Number(age),
        gender,
        phone
      };
      const res = await API.post("/patients/register", payload);
      alert(`Registration Successful! Your Patient ID is: ${res.data.patient_id}`);
      setIsLogin(true); // Switch to login view
      setId(res.data.patient_id); // Auto-fill ID
      setRole("PATIENT");
    } catch (err) {
      console.log("REGISTER ERROR:", err);
      alert(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '400px', maxWidth: '90%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '50%' }}>
            <HeartPulse size={32} />
          </div>
        </div>
        <h2 style={{ marginBottom: '8px' }}>Clinic Portal</h2>
        <p style={{ marginBottom: '24px' }}>Welcome to the Clinic Management System</p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '8px' }}>
          <button 
            type="button"
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: isLogin ? 'var(--card-bg)' : 'transparent', color: isLogin ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isLogin ? '600' : '500', boxShadow: isLogin ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            type="button"
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: !isLogin ? 'var(--card-bg)' : 'transparent', color: !isLogin ? 'var(--primary)' : 'var(--text-muted)', fontWeight: !isLogin ? '600' : '500', boxShadow: !isLogin ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="input-group">
              <label>ID Number</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  placeholder="Enter your ID"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            {role !== "PATIENT" && (
              <div className="input-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    placeholder="Enter Priority Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
              <LogIn size={18} /> Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Age</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} required placeholder="30" />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+1 234 567 890" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
              <UserPlus size={18} /> Register Patient
            </button>
          </form>
        )}
      </div>
    </div>
  );
}