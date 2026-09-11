import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/axiosInstance.js';
import Layout from '../../components/Layout.jsx';
import { ErrorText, PageHeader, Stat, StatusBadge } from '../../components/Ui.jsx';
import OperationsWidgets from '../../components/OperationsWidgets.jsx';

export default function EmployeeDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    const [attendanceRes, leaveRes] = await Promise.all([api.get('/attendance/me'), api.get('/leave/me')]);
    setAttendance(attendanceRes.data);
    setLeaves(leaveRes.data);
  }

  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = useMemo(() => attendance.find((row) => row.date?.slice(0, 10) === today), [attendance, today]);

  async function checkIn() {
    setError('');
    try {
      await api.post('/attendance/check-in');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function checkOut() {
    setError('');
    try {
      await api.post('/attendance/check-out');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <PageHeader title="Employee Dashboard" eyebrow="Today" />
      <OperationsWidgets />
      <div data-testid="employee-dashboard" className="grid gap-4 md:grid-cols-3">
        <Stat label="Attendance" value={todayRecord?.checkIn ? 'Checked in' : 'Not started'} detail={todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : 'No check-in today'} />
        <Stat label="Pending Leave" value={leaves.filter((leave) => leave.status === 'PENDING').length} detail="Open requests" />
        <Stat label="Approved Leave" value={leaves.filter((leave) => leave.status === 'APPROVED').length} detail="Historical approvals" />
      </div>
      <div className="card mt-6 p-5">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-bold">Attendance action</h2>
            <p className="text-sm text-muted">Record your in-office day with one check-in and one check-out.</p>
          </div>
          <StatusBadge value={todayRecord?.status || 'PENDING'} />
        </div>
        <ErrorText message={error} />
        <div className="mt-4 flex flex-wrap gap-2">
          <button data-testid="check-in-button" disabled={Boolean(todayRecord?.checkIn)} className="btn btn-primary" onClick={checkIn}>Check in</button>
          <button data-testid="check-out-button" disabled={!todayRecord?.checkIn || Boolean(todayRecord?.checkOut)} className="btn btn-secondary" onClick={checkOut}>Check out</button>
        </div>
      </div>
    </Layout>
  );
}
