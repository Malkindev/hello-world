import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Page } from "@/components/site/Page";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPasswordPage });

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    const trimmedEmail = email.trim();
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage("If an account exists for that email, a password reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the password reset link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page className="flex min-h-[70vh] items-center justify-center">
      <div className="glass w-full max-w-md rounded-3xl p-7">
        <div className="label-mono">Account help</div>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Forgot password</h1>
        <p className="mt-2 text-sm text-steel">
          Enter the email on your Market Rise Digital account. We’ll send you a secure reset link.
        </p>
        {message && (
          <p className="mt-5 rounded-2xl border border-electric/40 bg-electric/10 p-3 text-sm">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-5 rounded-2xl border border-deal/50 bg-deal/10 p-3 text-sm">
            {error}
          </p>
        )}
        <form onSubmit={submit} className="mt-5 space-y-4">
          <input
            className="field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <button className="btn-electric w-full px-5 py-3 text-sm" disabled={busy}>
            {busy ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <div className="mt-4 text-xs text-steel">
          <Link to="/auth" className="hover:text-electric">
            Back to sign in
          </Link>
        </div>
      </div>
    </Page>
  );
}
