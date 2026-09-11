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
import Payroll from './pages/admin/Payroll.jsx';
import Payslips from './pages/employee/Payslips.jsx';
import Holidays from './pages/admin/Holidays.jsx';
import Announcements from './pages/admin/Announcements.jsx';
import Documents from './pages/Documents.jsx';
import AuditLog from './pages/admin/AuditLog.jsx';
import ReportsTrends from './pages/ReportsTrends.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute roles={['ADMIN']}><Employees /></ProtectedRoute>} />
      <Route path="/admin/departments" element={<ProtectedRoute roles={['ADMIN']}><Departments /></ProtectedRoute>} />
      <Route path="/admin/payroll" element={<ProtectedRoute roles={['ADMIN']}><Payroll /></ProtectedRoute>} />
      <Route path="/admin/holidays" element={<ProtectedRoute roles={['ADMIN']}><Holidays /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute roles={['ADMIN']}><Announcements /></ProtectedRoute>} />
      <Route path="/admin/audit-log" element={<ProtectedRoute roles={['ADMIN']}><AuditLog /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE', 'MANAGER']}><Documents /></ProtectedRoute>} />
      <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
      <Route path="/manager/dashboard" element={<ProtectedRoute roles={['MANAGER']}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/manager/team-attendance" element={<ProtectedRoute roles={['MANAGER']}><TeamAttendance /></ProtectedRoute>} />
      <Route path="/manager/leave-approvals" element={<ProtectedRoute roles={['MANAGER', 'ADMIN']}><LeaveApprovals /></ProtectedRoute>} />
      <Route path="/recruitment" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Recruitment /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Reports /></ProtectedRoute>} />
      <Route path="/reports/trends" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><ReportsTrends /></ProtectedRoute>} />
      <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
      <Route path="/employee/dashboard" element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/profile" element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}><MyProfile /></ProtectedRoute>} />
      <Route path="/employee/attendance" element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}><MyAttendance /></ProtectedRoute>} />
      <Route path="/employee/leave" element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}><MyLeave /></ProtectedRoute>} />
      <Route path="/employee/payslips" element={<ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}><Payslips /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
