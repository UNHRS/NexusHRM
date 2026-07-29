import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import Employees from './pages/admin/Employees.jsx';
import Departments from './pages/admin/Departments.jsx';
import ManagerDashboard from './pages/manager/Dashboard.jsx';
import TeamAttendance from './pages/manager/TeamAttendance.jsx';
import LeaveApprovals from './pages/manager/LeaveApprovals.jsx';
import EmployeeDashboard from './pages/employee/Dashboard.jsx';
import MyProfile from './pages/employee/MyProfile.jsx';
import MyAttendance from './pages/employee/MyAttendance.jsx';
import MyLeave from './pages/employee/MyLeave.jsx';
import Recruitment from './pages/Recruitment.jsx';
import Reports from './pages/Reports.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute roles={['ADMIN']}><Employees /></ProtectedRoute>} />
      <Route path="/admin/departments" element={<ProtectedRoute roles={['ADMIN']}><Departments /></ProtectedRoute>} />
      <Route path="/manager" element={<ProtectedRoute roles={['MANAGER']}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/manager/team-attendance" element={<ProtectedRoute roles={['MANAGER']}><TeamAttendance /></ProtectedRoute>} />
      <Route path="/manager/leave-approvals" element={<ProtectedRoute roles={['MANAGER', 'ADMIN']}><LeaveApprovals /></ProtectedRoute>} />
      <Route path="/recruitment" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Recruitment /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Reports /></ProtectedRoute>} />
      <Route path="/employee" element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/profile" element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}><MyProfile /></ProtectedRoute>} />
      <Route path="/employee/attendance" element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}><MyAttendance /></ProtectedRoute>} />
      <Route path="/employee/leave" element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}><MyLeave /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
