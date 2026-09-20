import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage } from "@/lib/auth";
import { Page } from "@/components/site/Page";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Your Password | Market Rise Digital" },
      {
        name: "description",
        content: "Forgot your Market Rise Digital password? Enter your email and we'll send you a reset link.",
      },
      { property: "og:title", content: "Reset Your Password | Market Rise Digital" },
      { property: "og:description", content: "Send yourself a password reset link by email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + "/reset-password",
    });
    setBusy(false);
    if (resetError) {
      setError(authErrorMessage(resetError.message));
      return;
    }
    setSent(true);
  };

  return (
    <Page className="flex min-h-[70vh] items-center justify-center">
      <div className="glass w-full max-w-md rounded-3xl p-7">
        <div className="label-mono">Account help</div>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Forgot password</h1>
        <p className="mt-2 text-sm text-steel">
          Enter the email on your account and we'll send a link to set a new password.
        </p>

        {sent ? (
          <p className="mt-5 flex items-start gap-2 rounded-2xl border border-electric/40 bg-electric/10 p-3 text-sm text-foreground">
            <MailCheck className="mt-0.5 size-4 shrink-0 text-electric" />
            If that email has an account, a reset link is on its way. Check your inbox and spam folder.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            {error && (
              <p role="alert" className="rounded-2xl border border-deal/50 bg-deal/10 p-3 text-sm text-foreground">
                {error}
              </p>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Email</span>
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <button className="btn-electric w-full px-5 py-3 text-sm" type="submit" disabled={busy}>
              {busy ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <div className="mt-4 text-xs text-steel">
          <Link to="/auth" className="hover:text-electric">
            Back to sign in
          </Link>
        </div>
      </div>
    </Page>
  );
}
