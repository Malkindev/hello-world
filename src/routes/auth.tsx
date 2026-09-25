import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authErrorMessage, useAuth } from "@/lib/auth";
import { Page } from "@/components/site/Page";

export const Route = createFileRoute("/auth")({ component: AuthPage });

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/", replace: true });
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "signup") setMode("signup");
  }, [loading, user, navigate]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (mode === "signup") {
      if (!form.name.trim()) return setError("Please enter your full name.");
      if (form.password.length < 8) return setError("Your password must be at least 8 characters long.");
      if (form.password !== form.confirm) return setError("The two passwords do not match.");
    }
    setBusy(true);
    try {
      if (mode === "signup") await signUp(form.email, form.password, form.name, form.phone);
      else await signIn(form.email, form.password);
      await navigate({ to: "/", replace: true });
    } catch (e) { setError(authErrorMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <Page className="flex min-h-[70vh] items-center justify-center">
      <div className="glass w-full max-w-md rounded-3xl p-7">
        <div className="mb-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-electric font-display text-2xl font-bold text-ink">M</div>
          <div className="label-mono mt-5">Customer account</div>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-steel">{mode === "signin" ? "Track orders, keep your favourites and check out faster." : "Create an account to use Market Rise Digital."}</p>
        </div>
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-hair p-1">
          {(["signin", "signup"] as Mode[]).map((m) => <button key={m} type="button" onClick={() => { setMode(m); setError(""); }} className={`rounded-full px-4 py-2 text-sm font-medium ${mode === m ? "bg-electric text-ink" : "text-steel hover:text-foreground"}`}>{m === "signin" ? "Sign in" : "Sign up"}</button>)}
        </div>
        {error && <p role="alert" className="mb-4 rounded-2xl border border-deal/50 bg-deal/10 p-3 text-sm text-foreground">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && <>
            <label className="block"><span className="mb-1.5 block text-xs text-steel">Full name</span><input className="field" value={form.name} onChange={(e) => set("name", e.target.value)} required /></label>
            <label className="block"><span className="mb-1.5 block text-xs text-steel">Phone number (optional)</span><input className="field" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></label>
          </>}
          <label className="block"><span className="mb-1.5 block text-xs text-steel">Email</span><input className="field" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></label>
          <label className="block"><span className="mb-1.5 block text-xs text-steel">Password</span><div className="relative"><input className="field pr-12" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} required /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-steel">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
          {mode === "signup" && <label className="block"><span className="mb-1.5 block text-xs text-steel">Confirm password</span><input className="field" type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} required /></label>}
          <button className="btn-electric w-full px-5 py-3 text-sm" type="submit" disabled={busy}>{busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        <div className="mt-4 flex justify-center text-xs text-steel"><Link to="/forgot-password" className="hover:text-electric">Forgot password?</Link></div>
      </div>
    </Page>
  );
}