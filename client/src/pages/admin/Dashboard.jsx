import { ArrowRight, CalendarCheck, Clock3, DollarSign, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import { PageHeader, Stat, StatusBadge } from '../../components/Ui.jsx';
import DataTable from '../../components/DataTable.jsx';
import { api } from '../../api/axiosInstance.js';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/employees'), api.get('/departments'), api.get('/attendance/all'), api.get('/leave/all')]).then(([e, d, a, l]) => {
      setEmployees(e.data);
      setDepartments(d.data);
      setAttendance(a.data);
      setLeaves(l.data);
    });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayRows = attendance.filter((row) => row.date?.slice(0, 10) === today);
  const presentPct = employees.length ? Math.round((todayRows.filter((row) => row.checkIn).length / employees.length) * 100) : 0;

  return (
    <Layout>
      <PageHeader title="Overview" eyebrow="Company operations" description="A current view of your people, time, and workplace activity." actions={<button className="btn btn-secondary" disabled title="Payroll is not configured yet"><DollarSign size={16} /> Generate payroll</button>} />
      <div data-testid="admin-dashboard" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Total employees" value={employees.length} detail="Active records" />
        <Stat label="Departments" value={departments.length} detail="Active teams" />
        <Stat label="Today’s attendance" value={`${presentPct}%`} detail={`${todayRows.length} records logged`} />
        <Stat label="Pending leave" value={leaves.filter((l) => l.status === 'PENDING').length} detail="Awaiting approval" />
        <Stat label="Payroll status" value="Not configured" detail="Connect payroll to enable" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-5"><div className="flex items-center justify-between"><div><h2 className="text-[18px] font-semibold">Attendance breakdown</h2><p className="mt-1 text-sm text-muted">Today across all employees</p></div><CalendarCheck size={19} className="text-muted" /></div><div className="mt-6 space-y-5">{[['Present', todayRows.filter((r) => r.status === 'PRESENT').length, 'bg-success'], ['Late', todayRows.filter((r) => r.status === 'LATE').length, 'bg-warning'], ['Half-day', todayRows.filter((r) => r.status === 'HALF_DAY').length, 'bg-sky-600'], ['Absent', Math.max(0, employees.length - todayRows.length), 'bg-destructive']].map(([label, value, color]) => <div key={label}><div className="mb-2 flex justify-between text-sm"><span className="font-medium">{label}</span><span className="font-mono text-muted">{value}</span></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${color}`} style={{ width: `${employees.length ? Math.max(2, (value / employees.length) * 100) : 0}%` }} /></div></div>)}</div></section>
        <section className="card p-5"><div className="flex items-center justify-between"><div><h2 className="text-[18px] font-semibold">Pending leave</h2><p className="mt-1 text-sm text-muted">Requests needing a decision</p></div><Clock3 size={19} className="text-muted" /></div><div className="mt-5 divide-y divide-line">{leaves.filter((l) => l.status === 'PENDING').slice(0, 3).map((row) => <div className="flex items-center justify-between gap-3 py-3 first:pt-0" key={row.id}><div className="min-w-0"><div className="truncate text-sm font-semibold">{row.employee.fullName}</div><div className="mt-1 text-xs text-muted">{row.leaveType} · {row.startDate.slice(0, 10)}</div></div><StatusBadge value={row.status} /></div>)}{!leaves.some((l) => l.status === 'PENDING') && <div className="py-6 text-sm text-muted">No pending requests.</div>}</div><Link className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-action hover:underline" to="/manager/leave-approvals">Review all <ArrowRight size={15} /></Link></section>
      </div>
      <section className="mt-6 card p-5"><div className="flex items-center justify-between"><div><h2 className="text-[18px] font-semibold">Quick actions</h2><p className="mt-1 text-sm text-muted">Common operations for your team</p></div><Users size={19} className="text-muted" /></div><div className="mt-4 flex flex-wrap gap-3"><Link className="btn btn-secondary" to="/admin/employees">Manage employees <ArrowRight size={15} /></Link><Link className="btn btn-secondary" to="/admin/departments">Manage departments <ArrowRight size={15} /></Link></div></section>
    </Layout>
  );
}
