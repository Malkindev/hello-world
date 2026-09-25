import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/site/Page";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPasswordPage });
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setMessage("");
    const accounts = JSON.parse(localStorage.getItem("mrd-local-accounts") || "[]") as {email:string}[];
    if (!accounts.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) { setError("No local account was found for that email."); return; }
    setMessage("This site now uses local browser accounts. Use the Reset Password page to choose a new password.");
  };
  return <Page className="flex min-h-[70vh] items-center justify-center"><div className="glass w-full max-w-md rounded-3xl p-7"><div className="label-mono">Account help</div><h1 className="mt-2 font-display text-3xl font-bold text-foreground">Forgot password</h1><p className="mt-2 text-sm text-steel">Enter your account email to continue.</p>{message && <p className="mt-5 rounded-2xl border border-electric/40 bg-electric/10 p-3 text-sm">{message}</p>}{error && <p role="alert" className="mt-5 rounded-2xl border border-deal/50 bg-deal/10 p-3 text-sm">{error}</p>}<form onSubmit={submit} className="mt-5 space-y-4"><input className="field" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required/><button className="btn-electric w-full px-5 py-3 text-sm">Continue</button></form><div className="mt-4 text-xs text-steel"><Link to="/auth" className="hover:text-electric">Back to sign in</Link></div></div></Page>;
}