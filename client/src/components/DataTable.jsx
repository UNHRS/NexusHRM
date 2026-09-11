export default function DataTable({ columns, rows, getKey, testId }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left" data-testid={testId} aria-busy="false">
          <thead className="border-b border-line bg-slate-50/70">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="table-cell text-xs font-bold uppercase tracking-wide text-muted">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted">No records found.</td></tr>}
            {rows.map((row) => (
              <tr key={getKey(row)} data-testid={`${testId}-row`} className="border-b border-line last:border-0">
                {columns.map((column) => (
                  <td key={column.key} className="table-cell align-middle">{column.render ? column.render(row) : row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
