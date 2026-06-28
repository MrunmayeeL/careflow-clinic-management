import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { 
  HeartPulse, 
  LogOut, 
  LayoutDashboard, 
  CalendarDays, 
  FileText, 
  Users, 
  Pill, 
  Activity,
  Menu
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) {
    navigate("/");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleNavItems = {
    PATIENT: [
      { name: "My Dashboard", icon: <LayoutDashboard size={20}/>, path: "/patient" },
      { name: "Appointments", icon: <CalendarDays size={20}/>, path: "/patient?tab=appointments" },
      { name: "Prescriptions", icon: <Pill size={20}/>, path: "/patient?tab=prescriptions" },
    ],
    DOCTOR: [
      { name: "My Dashboard", icon: <LayoutDashboard size={20}/>, path: "/doctor" },
      { name: "My Patients", icon: <Users size={20}/>, path: "/doctor?tab=patients" },
      { name: "Medical Records", icon: <FileText size={20}/>, path: "/doctor?tab=records" },
    ],
    ADMIN: [
      { name: "Overview", icon: <Activity size={20}/>, path: "/admin" },
      { name: "Manage Entity", icon: <Users size={20}/>, path: "/admin?tab=staff" },
      { name: "Appointments", icon: <CalendarDays size={20}/>, path: "/admin?tab=appointments" },
      { name: "Billing", icon: <FileText size={20}/>, path: "/admin?tab=billing" },
    ]
  };

  const navItems = roleNavItems[user.role] || [];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '8px' }}>
              <HeartPulse size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>MedCare</h2>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item, i) => {
              // Basic active state
              const isActive = item.path === location.pathname + location.search || (item.path === location.pathname && location.search === "");
              return (
                <Link
                  key={i}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: isActive ? 'var(--primary)' : 'var(--text-main)',
                    background: isActive ? 'var(--card-bg)' : 'transparent',
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    border: isActive ? '1px solid var(--card-border)' : '1px solid transparent',
                    textDecoration: 'none',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all 0.2s',
                  }}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#2d3748' }}>
                {user.id}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-main)' }}>User {user.id}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--danger)', color: '#2d3748', fontWeight: '600', cursor: 'pointer' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="main-content">
        {/* Header */}
        <div className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '500' }}>
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()} Portal
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <span className="badge badge-success">System Online</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="content-scroll">
          {children}
        </div>
      </div>
    </div>
  );
}
