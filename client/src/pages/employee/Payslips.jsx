import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import { ErrorText, PageHeader } from '../../components/Ui.jsx';
import { api } from '../../api/axiosInstance.js';

const money = (value) => new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 2 }).format(Number(value || 0));
export default function Payslips() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/payroll/me').then((response) => setRows(response.data)).catch((err) => setError(err.message)); }, []);
  return <Layout><PageHeader title="My Payslips" eyebrow="Personal finance" description="Finalized monthly payslips from Nexus Operations." /><ErrorText message={error} /><div className="mt-6 space-y-3">{rows.map((row) => { const label = `${new Date(row.payrollRun.year, row.payrollRun.month - 1, 1).toLocaleDateString(undefined, { month: 'long' })} ${row.payrollRun.year}`; const expanded = open === row.id; return <article className="card overflow-hidden" key={row.id}><button className="flex min-h-16 w-full items-center justify-between gap-4 px-5 text-left hover:bg-slate-50" onClick={() => setOpen(expanded ? null : row.id)}><span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-action"><FileText size={17} /></span><span><span className="block text-sm font-semibold">{label}</span><span className="block text-xs text-muted">Net pay {money(row.netPay)}</span></span></span>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>{expanded && <div className="grid gap-4 border-t border-line bg-slate-50/60 p-5 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Gross pay" value={money(row.grossPay)} /><Metric label="Deductions" value={money(row.totalDeductions)} /><Metric label="Present days" value={row.presentDays} /><Metric label="Unpaid leave" value={row.unpaidLeaveDays} /><Metric label="Basic salary" value={money(row.basicSalary)} /><Metric label="Allowances" value={money(row.allowances)} /><Metric label="Late deduction" value={money(row.lateDeduction)} /><Metric label="Net pay" value={money(row.netPay)} /></div>}</article>; })}{!rows.length && !error && <div className="card p-10 text-center text-sm text-muted">No finalized payslips are available yet.</div>}</div></Layout>;
}
function Metric({ label, value }) { return <div><div className="text-xs font-bold uppercase tracking-[0.06em] text-muted">{label}</div><div className="mt-1 font-mono text-sm font-semibold tabular-nums">{value}</div></div>; }
