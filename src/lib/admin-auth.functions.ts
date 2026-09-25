import { createServerFn } from "@tanstack/react-start";

const disabledAdminAuthMessage =
  "Legacy admin authentication is disabled. Admin access now uses Supabase email/password authentication in the /admin route.";

export const loginAdmin = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(() => {
    throw new Error(disabledAdminAuthMessage);
  });

export const checkAdminSession = createServerFn({ method: "GET" }).handler(() => ({
  authenticated: false,
}));

export const logoutAdmin = createServerFn({ method: "POST" }).handler(() => ({
  authenticated: false,
}));
