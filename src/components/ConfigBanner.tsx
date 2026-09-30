import { useAuth } from "@/contexts/AuthContext";

export function ConfigBanner() {
  const { configured } = useAuth();
  if (configured) return null;
  return (
    <div className="alert alert--warn container" style={{ marginTop: "0.75rem" }}>
      Store login is not set up yet. Add host credentials or Supabase in GitHub repo
      secrets (see README), then redeploy.
    </div>
  );
}
