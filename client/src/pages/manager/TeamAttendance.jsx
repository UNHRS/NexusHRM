import { useEffect, useState } from 'react';
import { api } from '../../api/axiosInstance.js';
import DataTable from '../../components/DataTable.jsx';
import Layout from '../../components/Layout.jsx';
import { PageHeader, StatusBadge } from '../../components/Ui.jsx';

export default function TeamAttendance() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get('/attendance/team').then((res) => setRows(res.data)); }, []);
  return (
    <Layout>
      <PageHeader title="Team Attendance" eyebrow="Direct reports" />
      <DataTable
        testId="team-attendance-table"
        rows={rows}
        getKey={(row) => row.id}
        columns={[
          { key: 'employee', label: 'Employee', render: (row) => row.employee.fullName },
          { key: 'department', label: 'Department', render: (row) => row.employee.department?.name },
          { key: 'date', label: 'Date', render: (row) => row.date.slice(0, 10) },
          { key: 'checkIn', label: 'Check in', render: (row) => row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : '-' },
          { key: 'checkOut', label: 'Check out', render: (row) => row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : '-' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }
        ]}
      />
    </Layout>
  );
}
