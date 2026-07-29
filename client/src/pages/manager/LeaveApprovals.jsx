import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../api/axiosInstance.js';
import DataTable from '../../components/DataTable.jsx';
import Layout from '../../components/Layout.jsx';
import { ErrorText, PageHeader, StatusBadge } from '../../components/Ui.jsx';

export default function LeaveApprovals() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get('/leave/pending');
    setRows(res.data);
  }

  useEffect(() => { load(); }, []);

  async function decide(id, action) {
    setError('');
    try {
      await api.patch(`/leave/${id}/${action}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <PageHeader title="Leave Approvals" eyebrow="Pending requests" />
      <ErrorText message={error} />
      <div className="mt-4">
        <DataTable
          testId="leave-approvals-table"
          rows={rows}
          getKey={(row) => row.id}
          columns={[
            { key: 'employee', label: 'Employee', render: (row) => row.employee.fullName },
            { key: 'type', label: 'Type', render: (row) => row.leaveType },
            { key: 'dates', label: 'Dates', render: (row) => `${row.startDate.slice(0, 10)} to ${row.endDate.slice(0, 10)}` },
            { key: 'reason', label: 'Reason', render: (row) => row.reason || '-' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'actions', label: 'Actions', render: (row) => (
              <div className="flex gap-2">
                <button data-testid={`approve-leave-${row.id}`} className="btn btn-primary h-8" onClick={() => decide(row.id, 'approve')}><Check size={14} /> Approve</button>
                <button data-testid={`reject-leave-${row.id}`} className="btn btn-danger h-8" onClick={() => decide(row.id, 'reject')}><X size={14} /> Reject</button>
              </div>
            ) }
          ]}
        />
      </div>
    </Layout>
  );
}
