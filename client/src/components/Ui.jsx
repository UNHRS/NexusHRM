export function PageHeader({ title, eyebrow, actions }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && <div className="text-xs font-semibold uppercase tracking-wide text-muted">{eyebrow}</div>}
        <h1 className="mt-1 text-2xl font-bold tracking-normal text-ink">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, detail }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
      {detail && <div className="mt-1 text-sm text-muted">{detail}</div>}
    </div>
  );
}

export function StatusBadge({ value }) {
  const styles = {
    PRESENT: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    LATE: 'bg-amber-50 text-amber-800 ring-amber-200',
    ABSENT: 'bg-red-50 text-red-800 ring-red-200',
    HALF_DAY: 'bg-sky-50 text-sky-800 ring-sky-200',
    PENDING: 'bg-amber-50 text-amber-800 ring-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    REJECTED: 'bg-red-50 text-red-800 ring-red-200'
  };
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ring-1 ${styles[value] || 'bg-stone-100 text-ink ring-line'}`}>{value}</span>;
}

export function ErrorText({ message }) {
  if (!message) return null;
  return <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">{message}</div>;
}

export function Empty({ children = 'No records found.' }) {
  return <div className="card p-6 text-center text-sm text-muted">{children}</div>;
}
