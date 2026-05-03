import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROL_SEVIYE } from '../lib/rolLabels.jsx';

export default function PrivateRoute({ children, minRole }) {
  const { user, token, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Yükleniyor…
      </div>
    );
  }

  if (!token || !user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (!user.mubilAccess) {
    return <Navigate to="/login?error=no_access" replace />;
  }

  if (minRole) {
    const have = ROL_SEVIYE[user.mubilRole] || 0;
    const need = ROL_SEVIYE[minRole] || 0;
    if (have < need) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
