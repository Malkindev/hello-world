import { createServerFn } from "@tanstack/react-start";

export const checkAdminAccess = createServerFn({ method: "GET" }).handler(() => ({
  isAdmin: false,
}));
