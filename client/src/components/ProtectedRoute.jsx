import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 text-sm text-muted">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={routeForRole(user.role)} replace />;
  return children;
}

export function routeForRole(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'MANAGER') return '/manager';
  return '/employee';
}
