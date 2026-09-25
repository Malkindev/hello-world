import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useLocation,
  useNavigate,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { CustomerAccountSync } from "@/components/site/CustomerAccountSync";
import { WishlistSync } from "@/components/site/WishlistSync";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BottomNav } from "@/components/site/BottomNav";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-steel">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-electric px-6 py-3 text-sm">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-steel">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-electric px-5 py-2.5 text-sm"
          >
            Try again
          </button>
          <a href="/" className="btn-ghost px-5 py-2.5 text-sm">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Market Rise Digital — Smart Phones. Smart Choices." },
      {
        name: "description",
        content:
          "Genuine smartphones and phone accessories in Kenya at competitive prices. Buy on WhatsApp, pay with M-Pesa, delivered countrywide.",
      },
      { name: "author", content: "Market Rise Digital" },
      { name: "theme-color", content: "#0b0f17" },
      { property: "og:site_name", content: "Market Rise Digital" },
      { property: "og:title", content: "Market Rise Digital — Smart Phones. Smart Choices." },
      {
        property: "og:description",
        content: "Genuine smartphones and accessories in Kenya. Simple, trusted buying experience.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <CustomerAccountSync />
          <WishlistSync />
          <ProtectedApp />
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const AUTH_PUBLIC_PATHS = new Set(["/auth", "/forgot-password", "/reset-password", "/admin"]);

function ProtectedApp() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPath = AUTH_PUBLIC_PATHS.has(location.pathname);

  useEffect(() => {
    if (typeof window === "undefined" || loading || !user) return;
    if (location.pathname === "/admin" || location.pathname === "/auth") return;

    try {
      sessionStorage.setItem("mrd-last-public-path", window.location.pathname + window.location.search + window.location.hash);
    } catch {
      // Ignore storage failures; the admin route falls back to the home page.
    }
  }, [location.href, location.pathname, loading, user]);

  useEffect(() => {
    if (!loading && !user && !isAuthPath) {
      void navigate({ to: "/auth", replace: true });
    }
  }, [loading, user, isAuthPath, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-4">
        <div className="glass h-56 w-full max-w-md rounded-3xl" />
      </div>
    );
  }

  if (!user) {
    if (!isAuthPath) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-ink px-4">
          <div className="glass w-full max-w-md rounded-3xl p-7 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-electric/10">
              <span className="font-display text-xl font-bold text-electric">M</span>
            </div>
            <p className="mt-5 text-sm text-steel">Please sign in to continue.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-ink">
        <Outlet />
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <SiteHeader />
      <div className="flex-1">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </div>
      <SiteFooter />
      <BottomNav />
      <Toaster position="top-center" />
    </div>
  );
}
