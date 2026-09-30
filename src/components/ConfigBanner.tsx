import { useAuth } from "@/contexts/AuthContext";

export function ConfigBanner() {
  const { configured } = useAuth();
  if (configured) return null;
  return (
    <div className="alert alert--warn container" style={{ marginTop: "0.75rem" }}>
      Store backend is not connected yet. Add <code>VITE_SUPABASE_URL</code> and{" "}
      <code>VITE_SUPABASE_ANON_KEY</code> (see README) to enable live inventory and
      admin login.
    </div>
  );
}
