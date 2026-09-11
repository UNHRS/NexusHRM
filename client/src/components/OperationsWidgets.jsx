import { CalendarDays, Megaphone, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/axiosInstance.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function OperationsWidgets() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [holiday, setHoliday] = useState(null);
  const [expiring, setExpiring] = useState([]);
  useEffect(() => {
    const year = new Date().getFullYear();
    Promise.all([api.get('/announcements'), api.get(`/holidays?year=${year}`), user.role === 'ADMIN' ? api.get('/documents/expiring?days=30') : Promise.resolve({ data: [] })]).then(([a, h, d]) => { setAnnouncements(a.data); setHoliday(h.data.find((item) => new Date(item.date) >= new Date()) || null); setExpiring(d.data); }).catch(() => {});
  }, [user.role]);
  return <div className="mt-6 grid gap-4 lg:grid-cols-3">
    <section className="card p-4"><div className="flex items-center gap-2 text-sm font-semibold"><Megaphone size={17} className="text-action" /> Announcements</div>{announcements.slice(0, 2).map((item) => <div className="mt-3 border-t border-line pt-3" key={item.id}><div className="text-sm font-semibold">{item.title}</div><p className="mt-1 line-clamp-2 text-xs text-muted">{item.body}</p></div>)}{!announcements.length && <p className="mt-3 text-sm text-muted">No active announcements.</p>}</section>
    <section className="card p-4"><div className="flex items-center gap-2 text-sm font-semibold"><CalendarDays size={17} className="text-action" /> Next holiday</div>{holiday ? <><div className="mt-4 text-sm font-semibold">{holiday.name}</div><div className="mt-1 text-xs text-muted">{new Date(holiday.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div></> : <p className="mt-3 text-sm text-muted">No upcoming holidays found.</p>}</section>
    {user.role === 'ADMIN' && <section className="card p-4"><div className="flex items-center gap-2 text-sm font-semibold"><ShieldAlert size={17} className="text-warning" /> Documents expiring soon</div><div className="mt-4 text-2xl font-semibold tabular-nums">{expiring.length}</div><div className="mt-1 text-xs text-muted">Within the next 30 days</div></section>}
  </div>;
}
