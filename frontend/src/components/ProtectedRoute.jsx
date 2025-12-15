import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../utils/auth';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
