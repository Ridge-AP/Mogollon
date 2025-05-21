// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";
import { decodeJwt }    from "../utils/jwt";

export default function ProtectedRoute({ children, roles = [] }) {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const decoded = decodeJwt(token);
  if (!decoded || !decoded.role) {
    return <Navigate to="/login" replace />;
  }
  const userRole = decoded.role;

  // Admins bypass any role check; others must match one of the allowed roles
  if (roles.length > 0 && userRole !== "admin" && !roles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
