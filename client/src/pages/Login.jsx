import { Eye, EyeOff, Lock, User } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="grid min-h-screen place-items-center bg-paper px-4 py-8">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-action text-lg font-black text-white">N</div>
          <div className="mt-4 text-[26px] font-bold tracking-[-0.02em] text-ink">Welcome back</div>
          <p className="mt-2 text-sm text-muted">Sign in to manage your people, time, and payroll.</p>
        </div>
        <form data-testid="login-form" onSubmit={submit} className="card space-y-5 p-8">
          <ErrorText message={error} />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Username</span>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-2.5 text-muted" size={16} />
              <input data-testid="username-input" className="field w-full pl-9" aria-label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-2.5 text-muted" size={16} />
              <input data-testid="password-input" type={showPassword ? 'text' : 'password'} className="field w-full pl-9 pr-10" aria-label="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1.5 rounded-md p-1.5 text-muted hover:bg-slate-100" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </label>
          <button data-testid="login-button" disabled={loading} className="btn btn-primary h-11 w-full">{loading ? 'Signing in…' : 'Sign in'}</button>
          <div className="rounded-lg border border-line bg-slate-50 p-3 text-xs leading-5 text-muted">
            Demo users share password <b>password123</b>: admin, manager.recruitment, manager.docs, employee.aasha.
          </div>
        </form>
      </div>
    </div>
  );
}
