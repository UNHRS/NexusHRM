import { Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/axiosInstance.js';
import DataTable from '../../components/DataTable.jsx';
import Layout from '../../components/Layout.jsx';
import { ErrorText, PageHeader } from '../../components/Ui.jsx';

const blank = {
  fullName: '',
  email: '',
  phone: '',
  designation: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  departmentId: '',
  managerId: '',
  username: '',
  password: 'password123',
  role: 'EMPLOYEE'
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [employeeRes, deptRes] = await Promise.all([api.get('/employees'), api.get('/departments')]);
    setEmployees(employeeRes.data);
    setDepartments(deptRes.data);
  }

  useEffect(() => { load(); }, []);

  const managers = employees.filter((employee) => ['ADMIN', 'MANAGER'].includes(employee.user?.role));
  const visible = useMemo(() => (filter ? employees.filter((employee) => String(employee.departmentId) === filter) : employees), [employees, filter]);

  function patch(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(employee) {
    setEditing(employee.id);
    setForm({
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone || '',
      designation: employee.designation,
      joiningDate: employee.joiningDate.slice(0, 10),
      departmentId: String(employee.departmentId),
      managerId: employee.managerId ? String(employee.managerId) : '',
      username: employee.user?.username || '',
      password: '',
      role: employee.user?.role || 'EMPLOYEE'
    });
  }

  function reset() {
    setEditing(null);
    setForm(blank);
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    const payload = {
      ...form,
      departmentId: Number(form.departmentId),
      managerId: form.managerId ? Number(form.managerId) : null,
      password: form.password || undefined
    };
    try {
      if (editing) await api.put(`/employees/${editing}`, payload);
      else await api.post('/employees', payload);
      reset();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this employee and related records?')) return;
    await api.delete(`/employees/${id}`);
    await load();
  }

  return (
    <Layout>
      <PageHeader
        title="Employees"
        eyebrow="People records"
        actions={<select className="field" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All departments</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>}
      />
      <form data-testid="employee-form" onSubmit={submit} className="card mb-4 grid gap-3 p-4 md:grid-cols-4">
        <input data-testid="employee-name-input" required className="field" placeholder="Full name" value={form.fullName} onChange={(e) => patch('fullName', e.target.value)} />
        <input data-testid="employee-email-input" required type="email" className="field" placeholder="Email" value={form.email} onChange={(e) => patch('email', e.target.value)} />
        <input className="field" placeholder="Phone" value={form.phone} onChange={(e) => patch('phone', e.target.value)} />
        <input data-testid="employee-designation-input" required className="field" placeholder="Designation" value={form.designation} onChange={(e) => patch('designation', e.target.value)} />
        <input required type="date" className="field" value={form.joiningDate} onChange={(e) => patch('joiningDate', e.target.value)} />
        <select data-testid="employee-department-select" required className="field" value={form.departmentId} onChange={(e) => patch('departmentId', e.target.value)}>
          <option value="">Department</option>
          {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
        </select>
        <select className="field" value={form.managerId} onChange={(e) => patch('managerId', e.target.value)}>
          <option value="">No manager</option>
          {managers.filter((m) => m.id !== editing).map((manager) => <option key={manager.id} value={manager.id}>{manager.fullName}</option>)}
        </select>
        <select className="field" value={form.role} onChange={(e) => patch('role', e.target.value)}>
          <option>EMPLOYEE</option>
          <option>MANAGER</option>
          <option>ADMIN</option>
        </select>
        <input data-testid="employee-username-input" className="field" placeholder="Username" value={form.username} onChange={(e) => patch('username', e.target.value)} />
        <input className="field" placeholder={editing ? 'New password optional' : 'Password'} value={form.password} onChange={(e) => patch('password', e.target.value)} />
        <div className="flex gap-2 md:col-span-2">
          <button data-testid="employee-save-button" className="btn btn-primary"><Plus size={16} /> {editing ? 'Save employee' : 'Add employee'}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={reset}><X size={16} /> Cancel</button>}
        </div>
      </form>
      <ErrorText message={error} />
      <div className="mt-4">
        <DataTable
          testId="employee-table"
          rows={visible}
          getKey={(row) => row.id}
          columns={[
            { key: 'fullName', label: 'Name' },
            { key: 'designation', label: 'Designation' },
            { key: 'department', label: 'Department', render: (row) => row.department?.name },
            { key: 'role', label: 'Role', render: (row) => row.user?.role || 'NO LOGIN' },
            { key: 'manager', label: 'Manager', render: (row) => row.manager?.fullName || '-' },
            { key: 'actions', label: 'Actions', render: (row) => (
              <div className="flex gap-2">
                <button data-testid={`edit-employee-${row.id}`} className="btn btn-secondary h-8" onClick={() => startEdit(row)}><Save size={14} /> Edit</button>
                <button data-testid={`delete-employee-${row.id}`} className="btn btn-danger h-8" onClick={() => remove(row.id)}><Trash2 size={14} /> Delete</button>
              </div>
            ) }
          ]}
        />
      </div>
    </Layout>
  );
}
