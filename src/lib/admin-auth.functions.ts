import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";

const ADMIN_EMAIL = "marketrisedigital254@gmail.com";
const ADMIN_PASSWORD_HASH =
  "540b39b6e34b3a9f00d5200baaf87eafc4f56fb14eb175d7436cff27029529cb";

const ADMIN_COOKIE = "__Host-mrd-admin";
const ADMIN_SESSION_SECONDS = 60 * 60 * 12;

function hashPassword(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function signature(expiresAt: number) {
  return createHmac("sha256", ADMIN_PASSWORD_HASH)
    .update(String(expiresAt), "utf8")
    .digest("hex");
}

function createSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS;
  return expiresAt + "." + signature(expiresAt);
}

function readSession() {
  const cookie = getRequestHeader("cookie") ?? "";
  const parts = cookie.split(/;\s*/);

  for (const part of parts) {
    const equals = part.indexOf("=");
    if (equals === -1) continue;
    if (part.slice(0, equals) === ADMIN_COOKIE) {
      return part.slice(equals + 1);
    }
  }

  return null;
}

function validSession(token: string | null) {
  if (!token) return false;

  const dot = token.indexOf(".");
  if (dot <= 0) return false;

  const expiresAt = Number(token.slice(0, dot));
  const provided = token.slice(dot + 1);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = signature(expiresAt);
  const providedBuffer = Buffer.from(provided, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

function setSessionCookie(token: string) {
  setResponseHeader(
    "Set-Cookie",
    [
      `${ADMIN_COOKIE}=${token}`,
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      "Path=/",
      "Max-Age=" + ADMIN_SESSION_SECONDS,
    ].join("; "),
  );
}

export const loginAdmin = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    if (data.email.trim().toLowerCase() !== ADMIN_EMAIL) {
      throw new Error("Incorrect admin email or password.");
    }

    const providedHash = hashPassword(data.password);
    const providedBuffer = Buffer.from(providedHash, "utf8");
    const expectedBuffer = Buffer.from(ADMIN_PASSWORD_HASH, "utf8");
    const correctPassword =
      providedBuffer.length === expectedBuffer.length &&
      timingSafeEqual(providedBuffer, expectedBuffer);

    if (!correctPassword) {
      throw new Error("Incorrect admin email or password.");
    }

    setSessionCookie(createSession());
    return { authenticated: true };
  });

export const checkAdminSession = createServerFn({ method: "GET" }).handler(() => ({
  authenticated: validSession(readSession()),
}));

export const logoutAdmin = createServerFn({ method: "POST" }).handler(() => {
  setResponseHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
  );
  return { authenticated: false };
});
