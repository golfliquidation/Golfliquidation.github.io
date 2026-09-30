import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/listings", label: "Listings" },
  { to: "/admin/inventory", label: "Inventory CRM" },
];

export function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login");
  }

  return (
    <div className="admin-layout app-shell--admin">
      <header className="admin-top">
        <div>
          <strong>Host panel</strong>
          {profile?.display_name ? (
            <span style={{ opacity: 0.85, marginLeft: "0.5rem", fontSize: "0.85rem" }}>
              {profile.display_name}
            </span>
          ) : null}
        </div>
        <button type="button" className="btn btn--ghost" onClick={() => void handleSignOut()}>
          Sign out
        </button>
      </header>
      <nav className="admin-nav" aria-label="Admin">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end}>
            {link.label}
          </NavLink>
        ))}
        <NavLink to="/">View site</NavLink>
      </nav>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
