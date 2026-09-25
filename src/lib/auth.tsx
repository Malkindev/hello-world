import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CustomerUser {
  id: string;
  email: string;
  user_metadata: { full_name?: string; phone?: string };
}
export interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}
export interface LocalSession { user: CustomerUser }
interface StoredAccount {
  id: string;
  email: string;
  passwordHash: string;
  full_name: string;
  phone: string;
}
interface AuthApi {
  session: LocalSession | null;
  user: CustomerUser | null;
  profile: CustomerProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const ACCOUNT_KEY = "mrd-local-accounts";
const SESSION_KEY = "mrd-local-session";
const AuthContext = createContext<AuthApi | null>(null);

function readAccounts(): StoredAccount[] {
  try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "[]") as StoredAccount[]; }
  catch { return []; }
}
function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
}
async function hash(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function userFromAccount(a: StoredAccount): CustomerUser {
  return { id: a.id, email: a.email, user_metadata: { full_name: a.full_name, phone: a.phone } };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) { setSession(null); setProfile(null); return; }
      const user = JSON.parse(raw) as CustomerUser;
      const account = readAccounts().find((a) => a.id === user.id);
      if (!account) { localStorage.removeItem(SESSION_KEY); setSession(null); setProfile(null); return; }
      const nextUser = userFromAccount(account);
      setSession({ user: nextUser });
      setProfile({ id: account.id, full_name: account.full_name, email: account.email, phone: account.phone });
    } catch {
      localStorage.removeItem(SESSION_KEY);
      setSession(null); setProfile(null);
    }
  }, []);

  useEffect(() => { load(); setLoading(false); }, [load]);

  const api = useMemo<AuthApi>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    refreshProfile: async () => load(),
    signIn: async (email, password) => {
      const account = readAccounts().find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
      if (!account || account.passwordHash !== await hash(password)) throw new Error("Wrong email or password.");
      const user = userFromAccount(account);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setSession({ user });
      setProfile({ id: account.id, full_name: account.full_name, email: account.email, phone: account.phone });
    },
    signUp: async (email, password, fullName, phone) => {
      const cleanEmail = email.trim().toLowerCase();
      const accounts = readAccounts();
      if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) throw new Error("Email already registered. Try signing in instead.");
      const account: StoredAccount = {
        id: crypto.randomUUID(), email: cleanEmail, passwordHash: await hash(password),
        full_name: fullName.trim(), phone: phone.trim(),
      };
      accounts.push(account); writeAccounts(accounts);
      const user = userFromAccount(account);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setSession({ user });
      setProfile({ id: account.id, full_name: account.full_name, email: account.email, phone: account.phone });
    },
    updatePassword: async (password) => {
      if (!session?.user) throw new Error("Please sign in first.");
      const accounts = readAccounts();
      const index = accounts.findIndex((a) => a.id === session.user.id);
      if (index < 0) throw new Error("Account not found.");
      accounts[index] = { ...accounts[index], passwordHash: await hash(password) };
      writeAccounts(accounts);
    },
    signOut: async () => {
      localStorage.removeItem(SESSION_KEY);
      setSession(null); setProfile(null);
    },
  }), [session, profile, loading, load]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
export function authErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : typeof error === "string" ? error : "Authentication request failed.";
}
