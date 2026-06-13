import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Route guard. Renders child routes only when a user is authenticated.
 * Otherwise redirects to /auth, preserving the originally requested
 * location so the user can be sent back after logging in.
 */
export default function ProtectedRoute() {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
