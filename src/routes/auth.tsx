import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Page } from "@/components/site/Page";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In or Create Account | Market Rise Digital" },
      {
        name: "description",
        content:
          "Sign in to your Market Rise Digital account or create one in seconds to track orders, save favourites and check out faster.",
      },
      { property: "og:title", content: "Sign In or Create Account | Market Rise Digital" },
      {
        property: "og:description",
        content: "Create your Market Rise Digital account to track orders and check out faster.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const store = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const adminEmail = String(import.meta.env.VITE_ADMIN_EMAIL ?? "").trim().toLowerCase();

  // Respect the existing ?mode=signin / ?mode=signup links used throughout the site.
  // TanStack route search is intentionally not required here; this keeps the route stable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "signin" || requestedMode === "signup") {
      setMode(requestedMode);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      const signedInEmail = user.email?.trim().toLowerCase() ?? "";
      void navigate({ to: adminEmail && signedInEmail === adminEmail ? "/admin" : "/" });
    }
  }, [loading, user, navigate, adminEmail]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await signUp({
          email: form.email.trim(),
          password: form.password,
          fullName: form.name.trim(),
          phone: form.phone.trim(),
        });
        if (res.error) {
          setError(res.error);
          return;
        }
        store.signIn({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
        toast.success("Account created — welcome to Market Rise Digital");
        await navigate({ to: "/" });
      } else {
        const signedInEmail = form.email.trim().toLowerCase();
        const res = await signIn({ email: signedInEmail, password: form.password });
        if (res.error) {
          setError(res.error);
          return;
        }
        const isAdmin = Boolean(adminEmail && signedInEmail === adminEmail);
        toast.success(isAdmin ? "Admin signed in" : "Signed in");
        await navigate({ to: isAdmin ? "/admin" : "/" });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <div className="glass mx-auto max-w-md rounded-3xl p-7">
        <div className="label-mono mb-2">My account</div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {mode === "signup" ? "Create your account" : "Sign in"}
        </h1>
        <p className="mt-2 text-sm text-steel">
          {mode === "signup"
            ? "Create an account to track orders, save favourites and check out faster."
            : "Welcome back. Sign in to see your orders and favourites."}
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span data-testid="auth-error">{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 grid gap-4">
          {mode === "signup" && (
            <>
              <label className="block">
                <span className="label-mono mb-2 block">Full name</span>
                <input
                  className="field"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </label>
              <label className="block">
                <span className="label-mono mb-2 block">Phone number</span>
                <input
                  className="field"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="07XX XXX XXX"
                />
              </label>
            </>
          )}
          <label className="block">
            <span className="label-mono mb-2 block">Email</span>
            <input
              className="field"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="label-mono mb-2 block">Password</span>
            <input
              className="field"
              type="password"
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="At least 6 characters"
            />
          </label>
          <button type="submit" disabled={busy} className="btn-electric w-full px-5 py-3.5 text-sm">
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "signup" ? "signin" : "signup"));
            setError(null);
          }}
          className="mt-5 w-full text-sm text-steel transition-colors hover:text-foreground"
        >
          {mode === "signup"
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </div>
    </Page>
  );
}