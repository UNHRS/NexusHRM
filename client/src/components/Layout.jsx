import { BarChart3, Building2, CalendarCheck, ClipboardCheck, DollarSign, FileText, LogOut, Menu, Megaphone, Network, ShieldCheck, Users, X } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const nav = {
  ADMIN: [['Overview', '/admin/dashboard', Building2, 'Overview'], ['Employees', '/admin/employees', Users, 'People'], ['Documents', '/documents', FileText, 'People'], ['Departments', '/admin/departments', Network, 'People'], ['Holidays', '/admin/holidays', CalendarCheck, 'Time & leave'], ['Leave approvals', '/manager/leave-approvals', ClipboardCheck, 'Time & leave'], ['Payroll', '/admin/payroll', DollarSign, 'Finance'], ['Reports', '/reports', BarChart3, 'Finance'], ['Announcements', '/admin/announcements', Megaphone, 'Finance'], ['Audit log', '/admin/audit-log', ShieldCheck, 'Finance']],
  MANAGER: [['Team overview', '/manager/dashboard', Building2, 'Overview'], ['Attendance', '/manager/team-attendance', CalendarCheck, 'Time & leave'], ['Leave approvals', '/manager/leave-approvals', ClipboardCheck, 'Time & leave'], ['Reports', '/reports', BarChart3, 'Finance']],
  EMPLOYEE: [['My overview', '/employee/dashboard', Building2, 'Overview'], ['My profile', '/employee/profile', Users, 'People'], ['Documents', '/documents', FileText, 'People'], ['Attendance', '/employee/attendance', CalendarCheck, 'Time & leave'], ['My leave', '/employee/leave', ClipboardCheck, 'Time & leave'], ['Payslips', '/employee/payslips', FileText, 'Finance']]
};

function initials(name = '') { return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); }

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const items = nav[user.role] || [];
  const active = items.find(([, to]) => location.pathname === to)?.[0] || 'Overview';
  async function onLogout() { await logout(); navigate('/login'); }
  const close = () => setOpen(false);
  const sidebar = <aside className={`fixed inset-y-0 left-0 z-30 flex w-[256px] flex-col bg-sidebar px-4 py-5 text-white transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="flex items-center justify-between px-2"><div className="flex items-center gap-2.5"><div className="grid h-8 w-8 place-items-center rounded-lg bg-action text-sm font-black">N</div><span className="text-[17px] font-bold tracking-tight">Nexus HRM</span></div><button className="rounded-lg p-2 text-slate-400 hover:bg-white/10 md:hidden" aria-label="Close navigation" onClick={close}><X size={18} /></button></div>
    <div className="mt-8 border-b border-white/10 px-2 pb-5"><div className="text-sm font-semibold">Nexus Operations</div><div className="mt-1 text-xs text-slate-400">People & workplace systems</div></div>
    <nav className="mt-6 flex-1 space-y-5" aria-label="Primary navigation">{['Overview', 'People', 'Time & leave', 'Finance'].map((group) => { const groupItems = items.filter((item) => item[3] === group); if (!groupItems.length) return null; return <div key={group}><div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{group}</div><div className="space-y-1">{groupItems.map(([label, to, Icon]) => <NavLink key={to} to={to} onClick={close} className={({ isActive }) => `relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${isActive ? 'bg-action/25 text-white before:absolute before:-left-4 before:h-6 before:w-[3px] before:rounded-r before:bg-action' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}><Icon size={17} />{label}</NavLink>)}</div></div>; })}</nav>
    <div className="border-t border-white/10 pt-4"><div className="flex items-center gap-3 px-2"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-700 text-xs font-bold">{initials(user.employee?.fullName || user.username)}</div><div className="min-w-0"><div className="truncate text-sm font-semibold">{user.employee?.fullName || user.username}</div><div className="text-xs text-slate-400">{user.role}</div></div></div><button data-testid="logout-button" className="mt-4 flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm text-slate-400 hover:bg-white/10 hover:text-white" onClick={onLogout}><LogOut size={16} /> Sign out</button></div>
  </aside>;
  return <div className="min-h-screen bg-paper text-ink">{open && <button aria-label="Close navigation overlay" className="fixed inset-0 z-20 bg-slate-950/40 md:hidden" onClick={close} />}{sidebar}<main className="min-h-screen md:pl-[256px]"><header className="sticky top-0 z-10 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur md:px-8"><div className="mx-auto flex max-w-[1400px] items-center justify-between"><div className="flex items-center gap-3"><button className="rounded-lg p-2 hover:bg-slate-200 md:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={19} /></button><div><div className="text-xs font-medium text-muted">Nexus Operations / {active}</div><div className="mt-0.5 text-sm font-semibold">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div></div></div><div className="hidden items-center gap-3 sm:flex"><div className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-xs font-bold text-ink">{initials(user.employee?.fullName || user.username)}</div></div></div></header><div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">{children}</div></main></div>;
}
