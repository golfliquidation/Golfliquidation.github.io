import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function StaffRoute() {
  const { loading, session, isStaff, configured, usingLocalBackend } = useAuth();

  if (loading) {
    return (
      <div className="admin-main">
        <p>Loading…</p>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="admin-main">
        <div className="alert alert--warn">
          Host login is not configured. Set <code>VITE_HOST_EMAIL</code> and{" "}
          <code>VITE_HOST_PASSWORD</code> (or Supabase keys) in GitHub Actions secrets.
        </div>
      </div>
    );
  }

  const hasSession = session || (usingLocalBackend && isStaff);
  if (!hasSession) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isStaff) {
    return (
      <div className="admin-main">
        <div className="alert alert--error">
          Your account does not have host access. Ask an admin to set your profile role
          to <strong>admin</strong> or <strong>host</strong>.
        </div>
      </div>
    );
  }

  return <Outlet />;
}
