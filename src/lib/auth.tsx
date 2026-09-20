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
import { supabase } from "@/integrations/supabase/client";

export interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

interface AuthApi {
  session: Session | null;
  user: User | null;
  profile: CustomerProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  const loadProfile = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .eq("id", id)
      .maybeSingle();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    void loadProfile(userId);
  }, [userId, loadProfile]);

  const api = useMemo<AuthApi>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile: async () => {
        if (userId) await loadProfile(userId);
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
      },
    }),
    [session, profile, loading, userId, loadProfile],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Turn backend auth errors into clear messages while preserving the server error. */
export function authErrorMessage(error: unknown): string {
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message ?? "")
          : "Authentication request failed.";

  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code ?? "").toLowerCase()
      : "";
  const m = message.toLowerCase();

  if (code === "signup_disabled" || m.includes("signups not allowed")) {
    return `Sign-ups are disabled for this project. Server message: "${message}". Enable email sign-ups in Lovable Cloud → More → Cloud → Users → Auth settings → Email.`;
  }

  if (code === "email_provider_disabled" || m.includes("email signups are disabled")) {
    return `Email sign-up is disabled for this project. Server message: "${message}". Enable the Email provider/sign-up option in Lovable Cloud.`;
  }

  if (m.includes("already registered") || m.includes("already been registered") || m.includes("user already")) {
    return `Email already registered. Server message: "${message}". Try signing in instead.`;
  }

  if (m.includes("invalid login credentials")) {
    return `Wrong email or password. Server message: "${message}".`;
  }

  if (m.includes("email not confirmed")) {
    return `Email confirmation is required. Server message: "${message}".`;
  }

  if (m.includes("password should be") || m.includes("weak password") || m.includes("password")) {
    return `Password rejected by the auth service: "${message}".`;
  }

  if (m.includes("rate limit") || m.includes("too many")) {
    return `Too many attempts. Server message: "${message}". Please wait a moment and try again.`;
  }

  if (m.includes("invalid email") || m.includes("unable to validate email")) {
    return `Invalid email address. Server message: "${message}".`;
  }

  return message;
}
