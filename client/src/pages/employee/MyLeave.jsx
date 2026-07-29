import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../api/axiosInstance.js';
import DataTable from '../../components/DataTable.jsx';
import Layout from '../../components/Layout.jsx';
import { ErrorText, PageHeader, StatusBadge } from '../../components/Ui.jsx';

const blank = { leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' };

export default function MyLeave() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get('/leave/me');
    setRows(res.data);
  }

  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/leave', form);
      setForm(blank);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <PageHeader title="My Leave" eyebrow="Requests and history" />
      <form data-testid="leave-form" onSubmit={submit} className="card mb-4 grid gap-3 p-4 md:grid-cols-5">
        <select data-testid="leave-type-select" className="field" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
          <option>ANNUAL</option>
          <option>SICK</option>
          <option>CASUAL</option>
          <option>UNPAID</option>
        </select>
        <input data-testid="leave-start-input" required type="date" className="field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        <input data-testid="leave-end-input" required type="date" className="field" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        <input data-testid="leave-reason-input" className="field" placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        <button data-testid="leave-submit-button" className="btn btn-primary"><Send size={16} /> Apply</button>
      </form>
      <ErrorText message={error} />
      <div className="mt-4">
        <DataTable
          testId="leave-table"
          rows={rows}
          getKey={(row) => row.id}
          columns={[
            { key: 'leaveType', label: 'Type' },
            { key: 'dates', label: 'Dates', render: (row) => `${row.startDate.slice(0, 10)} to ${row.endDate.slice(0, 10)}` },
            { key: 'reason', label: 'Reason', render: (row) => row.reason || '-' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }
          ]}
        />
      </div>
    </Layout>
  );
}
