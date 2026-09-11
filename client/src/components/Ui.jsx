import { AlertCircle, CheckCircle2, Clock3, XCircle } from 'lucide-react';

export function PageHeader({ title, eyebrow, description, actions }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="mt-1 text-[28px] font-bold tracking-[-0.02em] text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, detail }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-bold uppercase tracking-[0.06em] text-muted">{label}</div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
      {detail && <div className="mt-1 text-sm text-muted">{detail}</div>}
    </div>
  );
}

export function StatusBadge({ value }) {
  const styles = {
    PRESENT: 'bg-emerald-50 text-success ring-emerald-200',
    LATE: 'bg-amber-50 text-warning ring-amber-200',
    ABSENT: 'bg-red-50 text-destructive ring-red-200',
    HALF_DAY: 'bg-sky-50 text-sky-800 ring-sky-200',
    PENDING: 'bg-amber-50 text-warning ring-amber-200',
    APPROVED: 'bg-emerald-50 text-success ring-emerald-200',
    REJECTED: 'bg-red-50 text-destructive ring-red-200'
  };
  const Icon = ['PRESENT', 'APPROVED'].includes(value) ? CheckCircle2 : ['PENDING', 'LATE'].includes(value) ? Clock3 : ['ABSENT', 'REJECTED'].includes(value) ? XCircle : AlertCircle;
  return <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ring-1 ${styles[value] || 'bg-slate-100 text-ink ring-line'}`}><Icon size={13} aria-hidden="true" />{String(value).replace('_', ' ')}</span>;
}

export function ErrorText({ message }) {
  if (!message) return null;
  return <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-destructive"><AlertCircle size={16} />{message}</div>;
}

export function Empty({ children = 'No records found.' }) {
  return <div className="card p-6 text-center text-sm text-muted">{children}</div>;
}
