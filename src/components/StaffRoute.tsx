import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function StaffRoute() {
  const { loading, session, isStaff, configured } = useAuth();

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
          Configure Supabase environment variables before using the host panel.
        </div>
      </div>
    );
  }

  if (!session) {
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
