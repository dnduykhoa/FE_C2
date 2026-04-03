import { Navigate, Outlet } from 'react-router-dom';
import { getRoleName, useAuthStore } from '../../store/authStore';

export default function RequireRole({ roles = [] }) {
  const user = useAuthStore((state) => state.user);
  const roleName = getRoleName(user);
  const allowedRoles = roles.map((role) => String(role).toUpperCase());

  if (!allowedRoles.includes(roleName)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
