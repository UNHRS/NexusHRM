import { useEffect, useState } from 'react';
import { api } from '../../api/axiosInstance.js';
import DataTable from '../../components/DataTable.jsx';
import Layout from '../../components/Layout.jsx';
import { PageHeader, Stat, StatusBadge } from '../../components/Ui.jsx';
import OperationsWidgets from '../../components/OperationsWidgets.jsx';

export default function ManagerDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  useEffect(() => {
    Promise.all([api.get('/attendance/team'), api.get('/leave/pending')]).then(([attendanceRes, leaveRes]) => {
      setAttendance(attendanceRes.data);
      setLeaves(leaveRes.data);
    });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayRows = attendance.filter((row) => row.date?.slice(0, 10) === today);

  return (
    <Layout>
      <PageHeader title="Manager Dashboard" eyebrow="Team operations" />
      <OperationsWidgets />
      <div data-testid="manager-dashboard" className="grid gap-4 md:grid-cols-3">
        <Stat label="Team records today" value={todayRows.length} detail="Attendance entries" />
        <Stat label="Pending leaves" value={leaves.length} detail="Direct reports" />
        <Stat label="Late marks" value={todayRows.filter((row) => row.status === 'LATE').length} detail="Today" />
      </div>
      <div className="mt-6">
        <DataTable
          testId="manager-attendance-summary"
          rows={todayRows}
          getKey={(row) => row.id}
          columns={[
            { key: 'employee', label: 'Employee', render: (row) => row.employee.fullName },
            { key: 'checkIn', label: 'Check in', render: (row) => row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : '-' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }
          ]}
        />
      </div>
    </Layout>
  );
}
