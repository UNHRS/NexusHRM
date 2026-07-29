import { Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routeForRole } from '../components/ProtectedRoute.jsx';
import { ErrorText } from '../components/Ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: 'admin', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.username, form.password);
      navigate(routeForRole(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <div className="text-3xl font-bold text-ink">Nexus HRM</div>
          <p className="mt-2 text-sm text-muted">Sign in to manage employees, attendance, and leave workflows.</p>
        </div>
        <form data-testid="login-form" onSubmit={submit} className="card space-y-4 p-5">
          <ErrorText message={error} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Username</span>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-2.5 text-muted" size={16} />
              <input data-testid="username-input" className="field w-full pl-9" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-2.5 text-muted" size={16} />
              <input data-testid="password-input" type="password" className="field w-full pl-9" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </label>
          <button data-testid="login-button" disabled={loading} className="btn btn-primary w-full">{loading ? 'Signing in...' : 'Sign in'}</button>
          <div className="rounded-md bg-stone-50 p-3 text-xs leading-5 text-muted">
            Demo users share password <b>password123</b>: admin, manager.recruitment, manager.docs, employee.aasha.
          </div>
        </form>
      </div>
    </div>
  );
}
