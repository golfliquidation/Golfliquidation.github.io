import { useAuth } from "@/contexts/AuthContext";

export function ConfigBanner() {
  const { configured, usingLocalBackend } = useAuth();
  if (configured) {
    if (usingLocalBackend) {
      return (
        <div className="alert alert--info container" style={{ marginTop: "0.75rem" }}>
          Inventory is saved on this device/browser. Add Supabase in GitHub Actions secrets
          for cloud sync across phones and computers.
        </div>
      );
    }
    return null;
  }
  return (
    <div className="alert alert--warn container" style={{ marginTop: "0.75rem" }}>
      Store login is not set up yet. Add host credentials or Supabase in GitHub repo
      secrets (see README), then redeploy.
    </div>
  );
}
