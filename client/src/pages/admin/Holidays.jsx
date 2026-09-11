import { CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import DataTable from '../../components/DataTable.jsx';
import { ErrorText, PageHeader } from '../../components/Ui.jsx';
import { api } from '../../api/axiosInstance.js';

export default function Holidays() {
  const year = new Date().getFullYear();
  const [rows, setRows] = useState([]); const [form, setForm] = useState({ name: '', date: '' }); const [editing, setEditing] = useState(null); const [error, setError] = useState('');
  async function load() { setRows((await api.get(`/holidays?year=${year}`)).data); }
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  async function submit(event) { event.preventDefault(); setError(''); try { if (editing) await api.put(`/holidays/${editing}`, form); else await api.post('/holidays', form); setForm({ name: '', date: '' }); setEditing(null); await load(); } catch (err) { setError(err.message); } }
  async function remove(id) { if (!window.confirm('Delete this holiday?')) return; try { await api.delete(`/holidays/${id}`); await load(); } catch (err) { setError(err.message); } }
  return <Layout><PageHeader title="Holidays" eyebrow="Company calendar" description={`Public holidays excluded from payroll working-day calculations for ${year}.`} /><form className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-end" onSubmit={submit}><label className="flex-1 text-sm font-semibold">Holiday name<input className="field mt-2 w-full" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="text-sm font-semibold">Date<input className="field mt-2" required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><button className="btn btn-primary"><CalendarPlus size={16} /> {editing ? 'Save holiday' : 'Add holiday'}</button>{editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm({ name: '', date: '' }); }}>Cancel</button>}</form><ErrorText message={error} /><div className="mt-5"><DataTable testId="holiday-table" rows={rows} getKey={(row) => row.id} columns={[{ key: 'name', label: 'Holiday' }, { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() }, { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><button className="btn btn-secondary h-8" onClick={() => { setEditing(row.id); setForm({ name: row.name, date: row.date.slice(0, 10) }); }}><Pencil size={14} /> Edit</button><button className="btn btn-danger h-8" onClick={() => remove(row.id)}><Trash2 size={14} /> Delete</button></div> }]} /></div></Layout>;
}
