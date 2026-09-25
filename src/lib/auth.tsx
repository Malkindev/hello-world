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
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: CustomerProfile | null;
  signUp: (v: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => Promise<{ error: string | null }>;
  signIn: (v: { email: string; password: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  saveProfile: (v: {
    fullName: string;
    email: string;
    phone: string;
  }) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthApi | null>(null);

/** Surface the real backend message, lightly humanised where it is cryptic. */
function authMessage(error: { message?: string } | null): string {
  const raw = error?.message?.trim() || "Something went wrong. Please try again.";
  const lower = raw.toLowerCase();
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "That email already has an account — sign in instead. (Backend: " + raw + ")";
  }
  return raw;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .eq("id", userId)
      .maybeSingle();
    setProfile((data as CustomerProfile | null) ?? null);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next?.user) setProfile(null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) void loadProfile(session.user.id);
  }, [session?.user?.id, loadProfile, session?.user]);

  const api = useMemo<AuthApi>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,

      signUp: async ({ email, password, fullName, phone }) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) return { error: authMessage(error) };

        if (!data.session) {
          const fallback = await supabase.auth.signInWithPassword({ email, password });
          if (fallback.error) return { error: authMessage(fallback.error) };
          setSession(fallback.data.session);
        } else {
          setSession(data.session);
        }

        // Supabase returns an obfuscated user with no identities for an existing email
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          return { error: "That email already has an account — sign in instead." };
        }
        const userId = data.user?.id ?? data.session?.user.id;
        if (userId) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: userId,
            full_name: fullName,
            email,
            phone,
          });
          if (profileError) return { error: profileError.message };
          await loadProfile(userId);
        }
        return { error: null };
      },

      signIn: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: authMessage(error) };
        setSession(data.session);
        return { error: null };
      },

      signOut: async () => {
        setSession(null);
        setProfile(null);
        await supabase.auth.signOut();
      },

      updatePassword: async (password) => {
        const { error } = await supabase.auth.updateUser({ password });
        return { error: error ? authMessage(error) : null };
      },

      saveProfile: async ({ fullName, email, phone }) => {
        const userId = session?.user.id;
        if (!userId) return { error: "You are signed out. Please sign in again." };
        const { error } = await supabase
          .from("profiles")
          .upsert({ id: userId, full_name: fullName, email, phone });
        if (error) return { error: error.message };
        await loadProfile(userId);
        return { error: null };
      },

      refreshProfile: async () => {
        if (session?.user) await loadProfile(session.user.id);
      },
    }),
    [loading, session, profile, loadProfile],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}