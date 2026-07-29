import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../api/axiosInstance.js';
import Layout from '../../components/Layout.jsx';
import { ErrorText, PageHeader } from '../../components/Ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MyProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ email: '', phone: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.employee) setForm({ email: user.employee.email, phone: user.employee.phone || '' });
  }, [user]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.put(`/employees/${user.employeeId}`, form);
      setUser({ ...user, employee: res.data });
      setMessage('Profile updated');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <PageHeader title="My Profile" eyebrow="Personal record" />
      <form data-testid="profile-form" onSubmit={submit} className="card max-w-2xl space-y-4 p-5">
        <ErrorText message={error} />
        {message && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{message}</div>}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Name</span>
            <input disabled className="field w-full" value={user.employee.fullName} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Department</span>
            <input disabled className="field w-full" value={user.employee.department?.name || ''} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Email</span>
            <input className="field w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Phone</span>
            <input className="field w-full" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
        </div>
        <button className="btn btn-primary"><Save size={16} /> Save profile</button>
      </form>
    </Layout>
  );
}
