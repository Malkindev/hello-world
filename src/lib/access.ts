import type { User } from "@supabase/supabase-js";

export function getConfiguredAdminEmail(): string {
  const value = import.meta.env.VITE_ADMIN_EMAIL;
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isAdminUser(user: Pick<User, "email"> | null | undefined): boolean {
  const adminEmail = getConfiguredAdminEmail();
  const userEmail = user?.email?.trim().toLowerCase() ?? "";
  return Boolean(adminEmail && userEmail && userEmail === adminEmail);
}
