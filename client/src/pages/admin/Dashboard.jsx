import { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import { PageHeader, Stat, StatusBadge } from '../../components/Ui.jsx';
import DataTable from '../../components/DataTable.jsx';
import { api } from '../../api/axiosInstance.js';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/employees'), api.get('/attendance/all'), api.get('/leave/all')]).then(([e, a, l]) => {
      setEmployees(e.data);
      setAttendance(a.data);
      setLeaves(l.data);
    });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayRows = attendance.filter((row) => row.date?.slice(0, 10) === today);
  const presentPct = employees.length ? Math.round((todayRows.filter((row) => row.checkIn).length / employees.length) * 100) : 0;

  return (
    <Layout>
      <PageHeader title="Admin Dashboard" eyebrow="Company operations" />
      <div data-testid="admin-dashboard" className="grid gap-4 md:grid-cols-3">
        <Stat label="Employees" value={employees.length} detail="Active records" />
        <Stat label="Pending Leave" value={leaves.filter((l) => l.status === 'PENDING').length} detail="Awaiting approval" />
        <Stat label="Attendance Today" value={`${presentPct}%`} detail={`${todayRows.length} records logged`} />
      </div>
      <div className="mt-6">
        <DataTable
          testId="admin-leave-table"
          rows={leaves.slice(0, 6)}
          getKey={(row) => row.id}
          columns={[
            { key: 'employee', label: 'Employee', render: (row) => row.employee.fullName },
            { key: 'leaveType', label: 'Type' },
            { key: 'dates', label: 'Dates', render: (row) => `${row.startDate.slice(0, 10)} to ${row.endDate.slice(0, 10)}` },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }
          ]}
        />
      </div>
    </Layout>
  );
}
