import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../api/axiosInstance.js';
import DataTable from '../../components/DataTable.jsx';
import Layout from '../../components/Layout.jsx';
import { ErrorText, PageHeader } from '../../components/Ui.jsx';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get('/departments');
    setDepartments(res.data);
  }

  useEffect(() => { load(); }, []);

  async function create(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/departments', { name });
      setName('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function rename(dept) {
    const nextName = window.prompt('Department name', dept.name);
    if (!nextName) return;
    await api.put(`/departments/${dept.id}`, { name: nextName });
    await load();
  }

  async function remove(id) {
    if (!window.confirm('Delete this department?')) return;
    await api.delete(`/departments/${id}`);
    await load();
  }

  return (
    <Layout>
      <PageHeader title="Departments" eyebrow="Organization structure" />
      <form data-testid="department-form" onSubmit={create} className="card mb-4 flex flex-col gap-3 p-4 md:flex-row">
        <input className="field flex-1" placeholder="Department name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-primary"><Plus size={16} /> Add department</button>
      </form>
      <ErrorText message={error} />
      <div className="mt-4">
        <DataTable
          testId="department-table"
          rows={departments}
          getKey={(row) => row.id}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'employees', label: 'Employees', render: (row) => row._count?.employees || 0 },
            { key: 'actions', label: 'Actions', render: (row) => (
              <div className="flex gap-2">
                <button className="btn btn-secondary h-8" onClick={() => rename(row)}><Save size={14} /> Rename</button>
                <button className="btn btn-danger h-8" onClick={() => remove(row.id)}><Trash2 size={14} /> Delete</button>
              </div>
            ) }
          ]}
        />
      </div>
    </Layout>
  );
}
