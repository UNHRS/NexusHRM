import { CheckCircle2, LockKeyhole, Play, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import DataTable from '../../components/DataTable.jsx';
import { ErrorText, PageHeader, StatusBadge } from '../../components/Ui.jsx';
import { api } from '../../api/axiosInstance.js';

const monthName = (month) => new Date(2000, month - 1, 1).toLocaleDateString(undefined, { month: 'long' });
const money = (value) => new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function Payroll() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [runs, setRuns] = useState([]);
  const [run, setRun] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadRuns() {
    const response = await api.get('/payroll/runs');
    setRuns(response.data);
    const current = response.data.find((item) => item.month === month && item.year === year) || response.data[0];
    if (current) setRun((await api.get(`/payroll/runs/${current.id}`)).data);
  }

  useEffect(() => { loadRuns().catch((err) => setError(err.message)); }, []);

  async function generate() {
    setBusy(true); setError('');
    try { setRun((await api.post('/payroll/generate', { month, year })).data); await loadRuns(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function finalize() {
    if (!run || !window.confirm(`Finalize ${monthName(run.month)} ${run.year}? Finalized payroll cannot be recalculated.`)) return;
    setBusy(true); setError('');
    try { setRun((await api.patch(`/payroll/${run.id}/finalize`)).data); await loadRuns(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <Layout>
    <PageHeader title="Payroll" eyebrow="Finance / controlled workflow" description="Generate, review, and lock monthly payroll from attendance and approved leave." />
    <section className="card flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-wrap gap-3"><label className="block text-sm font-semibold">Month<select className="field mt-2 block w-44" value={month} onChange={(event) => setMonth(Number(event.target.value))}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{monthName(index + 1)}</option>)}</select></label><label className="block text-sm font-semibold">Year<input className="field mt-2 block w-28" type="number" min="2000" max="2200" value={year} onChange={(event) => setYear(Number(event.target.value))} /></label></div>
      <div className="flex flex-wrap gap-2"><button data-testid="payroll-generate" className="btn btn-primary" disabled={busy} onClick={generate}>{busy ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />} Generate payroll</button>{run && <button data-testid="payroll-finalize" className="btn btn-secondary" disabled={busy || run.status === 'FINALIZED'} onClick={finalize}>{run.status === 'FINALIZED' ? <LockKeyhole size={16} /> : <CheckCircle2 size={16} />} {run.status === 'FINALIZED' ? 'Finalized' : 'Finalize payroll'}</button>}</div>
    </section>
    <ErrorText message={error} />
    {run && <section className="mt-6"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-[18px] font-semibold">{monthName(run.month)} {run.year}</h2><p className="mt-1 text-sm text-muted">{run.payslips.length} employees · {money(run.payslips.reduce((sum, slip) => sum + Number(slip.netPay), 0))} net payroll</p></div><StatusBadge value={run.status} /></div><DataTable testId="payroll-table" rows={run.payslips} getKey={(row) => row.id} columns={[{ key: 'employee', label: 'Employee', render: (row) => <div><div className="font-semibold">{row.employee.fullName}</div><div className="text-xs text-muted">{row.employee.department?.name}</div></div> }, { key: 'workingDays', label: 'Working days' }, { key: 'presentDays', label: 'Present' }, { key: 'unpaidLeaveDays', label: 'Unpaid leave' }, { key: 'lateDeduction', label: 'Late deduction', render: (row) => money(row.lateDeduction) }, { key: 'grossPay', label: 'Gross', render: (row) => money(row.grossPay) }, { key: 'totalDeductions', label: 'Deductions', render: (row) => money(row.totalDeductions) }, { key: 'netPay', label: 'Net pay', render: (row) => <span className="font-semibold tabular-nums">{money(row.netPay)}</span> }]} /></section>}
    <section className="mt-8"><h2 className="mb-3 text-[18px] font-semibold">Payroll history</h2><DataTable testId="payroll-runs-table" rows={runs} getKey={(row) => row.id} columns={[{ key: 'period', label: 'Period', render: (row) => `${monthName(row.month)} ${row.year}` }, { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }, { key: 'count', label: 'Employees', render: (row) => row._count?.payslips || 0 }, { key: 'total', label: 'Total payout', render: (row) => money(row.totalPayout) }, { key: 'view', label: '', render: (row) => <button className="btn btn-secondary h-8" onClick={async () => setRun((await api.get(`/payroll/runs/${row.id}`)).data)}>View</button> }]} /></section>
  </Layout>;
}
