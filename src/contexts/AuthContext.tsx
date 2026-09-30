import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  backendSignIn,
  backendSignOut,
  isBackendConfigured,
  isLocalHostConfigured,
  isLocalSessionActive,
  isSupabaseConfigured,
} from "@/lib/backend";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  role: "admin" | "host" | "viewer";
  display_name: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isStaff: boolean;
  configured: boolean;
  usingLocalBackend: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [localActive, setLocalActive] = useState(isLocalSessionActive());
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const refreshProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    setProfile(await fetchProfile(userId));
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setLocalActive(isLocalSessionActive());
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void refreshProfile(data.session?.user.id).finally(() => setLoading(false));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void refreshProfile(nextSession?.user.id);
    });

    return () => subscription.unsubscribe();
  }, [refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await backendSignIn(email, password);
    if (!result.error && isLocalHostConfigured && !supabase) {
      setLocalActive(true);
    }
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await backendSignOut();
    setProfile(null);
    setLocalActive(false);
  }, []);

  const usingLocalBackend = isLocalHostConfigured && !isSupabaseConfigured;
  const isStaff =
    profile?.role === "admin" ||
    profile?.role === "host" ||
    (usingLocalBackend && localActive);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isStaff,
      configured: isBackendConfigured,
      usingLocalBackend,
      signIn,
      signOut,
    }),
    [session, profile, loading, isStaff, usingLocalBackend, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
