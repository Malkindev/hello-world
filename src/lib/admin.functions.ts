import { createServerFn } from "@tanstack/react-start";
import { checkAdminSession } from "./admin-auth.functions";

export const checkAdminAccess = createServerFn({ method: "GET" }).handler(async () => {
  const result = await checkAdminSession();
  return { isAdmin: result.authenticated };
});
