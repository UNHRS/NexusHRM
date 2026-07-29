import { BriefcaseBusiness, Building2, CalendarCheck, ClipboardCheck, LogOut, Network, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const nav = {
  ADMIN: [
    ['Dashboard', '/admin', Building2],
    ['Employees', '/admin/employees', Users],
    ['Departments', '/admin/departments', Network],
    ['Recruitment', '/recruitment', BriefcaseBusiness],
    ['Leave', '/manager/leave-approvals', ClipboardCheck]
  ],
  MANAGER: [
    ['Dashboard', '/manager', Building2],
    ['Attendance', '/manager/team-attendance', CalendarCheck],
    ['Leave Approvals', '/manager/leave-approvals', ClipboardCheck],
    ['Recruitment', '/recruitment', BriefcaseBusiness]
  ],
  EMPLOYEE: [
    ['Dashboard', '/employee', Building2],
    ['My Profile', '/employee/profile', Users],
    ['Attendance', '/employee/attendance', CalendarCheck],
    ['My Leave', '/employee/leave', ClipboardCheck]
  ]
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = nav[user.role] || [];

  async function onLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-paper px-4 py-5 md:block">
        <div className="mb-8">
          <div className="text-xl font-bold">Nexus HRM</div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">{user.role}</div>
        </div>
        <nav className="space-y-1">
          {items.map(([label, to, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin' || to === '/manager' || to === '/employee'}
              className={({ isActive }) =>
                `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium ${isActive ? 'bg-action text-white' : 'text-ink hover:bg-stone-200/60'}`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button data-testid="logout-button" className="btn btn-secondary absolute bottom-5 left-4 right-4" onClick={onLogout}>
          <LogOut size={16} /> Logout
        </button>
      </aside>
      <main className="md:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="font-bold">Nexus HRM</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {items.map(([label, to]) => (
              <NavLink key={to} to={to} className="rounded border border-line px-2 py-1 text-xs">
                {label}
              </NavLink>
            ))}
            <button className="rounded border border-line px-2 py-1 text-xs" onClick={onLogout}>Logout</button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
