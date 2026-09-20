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

/** Turn backend auth errors into clear, human messages. */
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("user already"))
    return "That email is already registered. Try signing in instead.";
  if (m.includes("invalid login credentials")) return "Wrong email or password. Please try again.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first — check your inbox for the confirmation link.";
  if (m.includes("password should be") || m.includes("weak password"))
    return "That password is too weak. Use at least 8 characters with letters and numbers.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("invalid email") || m.includes("unable to validate email"))
    return "Please enter a valid email address.";
  return message;
}
