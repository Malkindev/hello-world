import {
  createContext,
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
  }) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
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
  if (lower.includes("email not confirmed")) {
    return "Your email address has not been confirmed yet. Check your inbox, confirm the account, then sign in again.";
  }
  if (lower.includes("invalid login credentials")) {
    return "The email or password is incorrect. Check both and try again.";
  }
  return raw;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const profileFromUser = (currentUser: User | null): CustomerProfile | null => {
    if (!currentUser) return null;
    return {
      id: currentUser.id,
      full_name: String(currentUser.user_metadata?.full_name ?? ""),
      email: currentUser.email ?? "",
      phone: String(currentUser.user_metadata?.phone ?? ""),
    };
  };

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setProfile(profileFromUser(next?.user ?? null));
    });

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (active) {
          setSession(data.session);
          setProfile(profileFromUser(data.session?.user ?? null));
        }
      } catch (error) {
        console.error("[Auth] Failed to restore the Supabase session:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void restoreSession();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const api = useMemo<AuthApi>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,

      signUp: async ({ email, password, fullName, phone }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const cleanName = fullName.trim();
        const cleanPhone = phone.trim();

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: cleanName, phone: cleanPhone },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) return { error: authMessage(error) };

        // Supabase can return an obfuscated user with no identities for an existing email.
        // Detect this before any session work so sign-up can never authenticate an existing account.
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          if (data.session) await supabase.auth.signOut({ scope: "local" });
          setSession(null);
          setProfile(null);
          return { error: "That email already has an account — sign in instead." };
        }

        if (!data.session) {
          setSession(null);
          setProfile(null);
          return { error: null, needsConfirmation: true };
        }

        setSession(data.session);
        setProfile(profileFromUser(data.user ?? data.session.user));
        return { error: null, needsConfirmation: false };
      },

      signIn: async ({ email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) return { error: authMessage(error) };
        if (!data.session) {
          return { error: "Sign-in completed without an active session. Please try again." };
        }
        setSession(data.session);
        setProfile(profileFromUser(data.user));
        return { error: null };
      },

      signOut: async () => {
        setSession(null);
        setProfile(null);
        await supabase.auth.signOut({ scope: "local" });
      },

      updatePassword: async (password) => {
        const { error } = await supabase.auth.updateUser({ password });
        return { error: error ? authMessage(error) : null };
      },

      saveProfile: async ({ fullName, phone }) => {
        if (!session?.user) return { error: "You are signed out. Please sign in again." };

        const cleanName = fullName.trim();
        const cleanPhone = phone.trim();

        const { data, error } = await supabase.auth.updateUser({
          data: { full_name: cleanName, phone: cleanPhone },
        });
        if (error) return { error: authMessage(error) };

        const nextUser = data.user ?? session.user;
        setSession((current) => (current ? { ...current, user: nextUser } : current));
        setProfile(profileFromUser(nextUser));

        return { error: null };
      },

      refreshProfile: async () => {
        const currentUser = session?.user ?? null;
        setProfile(profileFromUser(currentUser));
      },
    }),
    [loading, session, profile],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}