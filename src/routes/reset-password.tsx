import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage } from "@/lib/auth";
import { Page } from "@/components/site/Page";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password | Market Rise Digital" },
      { name: "description", content: "Choose a new password for your Market Rise Digital customer account." },
      { property: "og:title", content: "Set a New Password | Market Rise Digital" },
      { property: "og:description", content: "Finish resetting your Market Rise Digital password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) return setError("Your password must be at least 8 characters long.");
    if (password !== confirm) return setError("The two passwords do not match.");
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(authErrorMessage(updateError.message));
      return;
    }
    navigate({ to: "/account", replace: true });
  };

  return (
    <Page className="flex min-h-[70vh] items-center justify-center">
      <div className="glass w-full max-w-md rounded-3xl p-7">
        <div className="label-mono">Account help</div>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Set a new password</h1>

        {!ready ? (
          <p className="mt-4 text-sm text-steel">
            Open this page from the reset link in your email. If the link has expired, request a new one from the
            forgot password page.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            {error && (
              <p role="alert" className="rounded-2xl border border-deal/50 bg-deal/10 p-3 text-sm text-foreground">
                {error}
              </p>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">New password</span>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Confirm new password</span>
              <input
                className="field"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />
            </label>
            <button className="btn-electric w-full px-5 py-3 text-sm" type="submit" disabled={busy}>
              {busy ? "Saving..." : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </Page>
  );
}
