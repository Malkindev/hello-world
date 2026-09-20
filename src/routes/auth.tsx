import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage, useAuth } from "@/lib/auth";
import { Page } from "@/components/site/Page";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In or Create an Account | Market Rise Digital" },
      {
        name: "description",
        content:
          "Sign in to your Market Rise Digital account or create one to track orders, save favourite phones and check out faster.",
      },
      { property: "og:title", content: "Sign In or Create an Account | Market Rise Digital" },
      {
        property: "og:description",
        content: "Customer accounts for order tracking, wishlists and faster checkout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/account", replace: true });
      return;
    }
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "signup") setMode("signup");
    if (requestedMode === "signin") setMode("signin");
  }, [loading, user, navigate]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (mode === "signup") {
      if (!form.name.trim()) return setError("Please enter your full name.");
      if (form.password.length < 8) return setError("Your password must be at least 8 characters long.");
      if (form.password !== form.confirm) return setError("The two passwords do not match.");
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin + "/account",
            data: { full_name: form.name.trim(), phone: form.phone.trim() },
          },
        });
        if (signUpError) {
          setError(authErrorMessage(signUpError.message));
          return;
        }
        if (!data.session) {
          setNotice("Account created. Check your email for a confirmation link, then sign in.");
          setMode("signin");
          setForm((f) => ({ ...f, password: "", confirm: "" }));
          return;
        }
        navigate({ to: "/" });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (signInError) {
        setError(authErrorMessage(signInError.message));
        return;
      }
      navigate({ to: "/" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/",
        },
      });
      if (oauthError) {
        setError(authErrorMessage(oauthError.message));
      }
    } catch {
      setError("Google sign-in is not available right now. Please use email and password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page className="flex min-h-[70vh] items-center justify-center">
      <div className="glass w-full max-w-md rounded-3xl p-7">
        <div className="mb-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-electric font-display text-2xl font-bold text-ink">
            M
          </div>
          <div className="label-mono mt-5">Customer account</div>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
            {mode === "signin" ? "Sign in" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-steel">
            {mode === "signin"
              ? "Track orders, keep your favourites and check out faster."
              : "It takes a minute and makes every future order easier."}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-hair p-1">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError("");
                setNotice("");
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === m ? "bg-electric text-ink" : "text-steel hover:text-foreground"
              }`}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {notice && (
          <p className="mb-4 flex items-start gap-2 rounded-2xl border border-electric/40 bg-electric/10 p-3 text-sm text-foreground">
            <MailCheck className="mt-0.5 size-4 shrink-0 text-electric" />
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="mb-4 rounded-2xl border border-deal/50 bg-deal/10 p-3 text-sm text-foreground">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={busy}
          className="btn-ghost flex w-full items-center justify-center gap-2 px-5 py-3 text-sm"
        >
          <span className="font-semibold">G</span>
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3 text-xs text-steel">
          <span className="h-px flex-1 bg-hair" />
          <span>or use email</span>
          <span className="h-px flex-1 bg-hair" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <>
              <label className="block">
                <span className="mb-1.5 block text-xs text-steel">Full name</span>
                <input
                  className="field"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Jane Wanjiru"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-steel">Phone number (optional)</span>
                <input
                  className="field"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="07xx xxx xxx"
                  autoComplete="tel"
                />
              </label>
            </>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs text-steel">Email</span>
            <input
              className="field"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-steel">Password</span>
            <div className="relative">
              <input
                className="field pr-12"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-steel hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>

          {mode === "signup" && (
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Confirm password</span>
              <input
                className="field"
                type="password"
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />
            </label>
          )}

          <button className="btn-electric w-full px-5 py-3 text-sm" type="submit" disabled={busy}>
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-4 flex justify-center text-xs text-steel">
          <Link to="/forgot-password" className="hover:text-electric">
            Forgot password?
          </Link>
        </div>
      </div>
    </Page>
  );
}
