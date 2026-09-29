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

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[Auth] Profile lookup failed:", error.message);
      setProfile(null);
      return;
    }

    setProfile((data as CustomerProfile | null) ?? null);
  }, []);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next?.user) setProfile(null);
    });

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (active) setSession(data.session);
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
        const normalizedEmail = email.trim().toLowerCase();
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: fullName.trim(), phone: phone.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) return { error: authMessage(error) };

        // Supabase can return an obfuscated user with no identities for an existing email.
        // Detect this before any session or profile work so sign-up can never authenticate
        // an account that already exists.
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          if (data.session) await supabase.auth.signOut({ scope: "local" });
          setSession(null);
          setProfile(null);
          return { error: "That email already has an account — sign in instead." };
        }

        if (!data.session) {
          // With Supabase email confirmation enabled, a successful signup
          // intentionally has no session until the user confirms the email.
          setSession(null);
          setProfile(null);
          return { error: null, needsConfirmation: true };
        }

        setSession(data.session);
        const userId = data.user?.id ?? data.session.user.id;
        if (userId) {
          // Auth is the source of truth. Keep the customer usable even when the
          // optional profile row is blocked by an RLS/configuration issue.
          setProfile({
            id: userId,
            full_name: fullName.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
          });

          const { error: profileError } = await supabase.from("profiles").upsert({
            id: userId,
            full_name: fullName.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
          });

          if (profileError) {
            console.warn("[Auth] Profile row could not be saved:", profileError.message);
          } else {
            await loadProfile(userId);
          }
        }
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

      saveProfile: async ({ fullName, email, phone }) => {
        const userId = session?.user.id;
        if (!userId) return { error: "You are signed out. Please sign in again." };

        const cleanName = fullName.trim();
        const cleanPhone = phone.trim();
        const cleanEmail = email.trim().toLowerCase();

        const { error: authError } = await supabase.auth.updateUser({
          data: { full_name: cleanName, phone: cleanPhone },
        });
        if (authError) return { error: authMessage(authError) };

        // Keep a local in-memory profile immediately; the table write is optional
        // so a profile RLS issue cannot break an otherwise valid account.
        setProfile({
          id: userId,
          full_name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
        });

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({ id: userId, full_name: cleanName, email: cleanEmail, phone: cleanPhone });

        if (profileError) {
          console.warn("[Auth] Profile row could not be updated:", profileError.message);
        } else {
          await loadProfile(userId);
        }

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