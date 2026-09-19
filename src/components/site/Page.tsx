import type { ReactNode } from "react";

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <main className={`relative mx-auto w-full max-w-7xl px-4 pb-16 pt-8 md:px-8 md:pt-12 ${className}`}>
      {children}
    </main>
  );
}

export function PageTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-rise">
      <div>
        {eyebrow && <div className="label-mono mb-2">{eyebrow}</div>}
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-steel sm:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="glass rounded-3xl p-10 text-center">
      <div className="font-display text-xl font-semibold text-foreground">{title}</div>
      {hint && <p className="mt-2 text-sm text-steel">{hint}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
