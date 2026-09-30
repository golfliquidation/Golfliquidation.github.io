import {
  isLocalHostConfigured,
  localGetSession,
  localSignIn,
  localSignOut,
} from "@/lib/local-backend";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export { isSupabaseConfigured, isLocalHostConfigured };

export const isBackendConfigured = isSupabaseConfigured || isLocalHostConfigured;

export function isLocalSessionActive(): boolean {
  return isLocalHostConfigured && localGetSession() !== null;
}

export async function backendSignIn(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }
  if (isLocalHostConfigured) {
    return { error: localSignIn(email, password) };
  }
  return { error: "Store backend is not configured yet." };
}

export async function backendSignOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
  localSignOut();
}
