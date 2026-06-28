import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import PatientDashboard from "../pages/PatientDashboard";
import DoctorDashboard from "../pages/DoctorDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/patient" element={
        <ProtectedRoute role="PATIENT">
          <DashboardLayout>
            <PatientDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/doctor" element={
        <ProtectedRoute role="DOCTOR">
          <DashboardLayout>
            <DoctorDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute role="ADMIN">
          <DashboardLayout>
            <AdminDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}