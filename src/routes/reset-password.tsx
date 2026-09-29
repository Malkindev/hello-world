import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Page } from "@/components/site/Page";

export const Route = createFileRoute("/reset-password")({ component: ResetPasswordPage });

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Please open the password reset link from your email before choosing a new password.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const result = await updatePassword(password);
      if (result.error) {
        setError(result.error);
        return;
      }
      await navigate({ to: "/account", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page className="flex min-h-[70vh] items-center justify-center">
      <div className="glass w-full max-w-md rounded-3xl p-7">
        <div className="label-mono">Account help</div>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Set a new password</h1>
        {!user ? (
          <p className="mt-4 text-sm text-steel">
            Open the secure password reset link sent to your email, then choose a new password here.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            {error && (
              <p role="alert" className="rounded-2xl border border-deal/50 bg-deal/10 p-3 text-sm">
                {error}
              </p>
            )}
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />
            <input
              className="field"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
            />
            <button className="btn-electric w-full px-5 py-3 text-sm" disabled={busy}>
              {busy ? "Saving..." : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </Page>
  );
}
