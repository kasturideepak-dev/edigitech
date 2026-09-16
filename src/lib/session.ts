// JWT session helpers — no DB or Node-only imports so this also runs in proxy.ts.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ed_session";
export const SESSION_DAYS = 7;

export type Role = "admin" | "editor" | "seo";
export type SessionPayload = { uid: number; role: Role; name: string };

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return { uid: Number(payload.uid), role: payload.role as Role, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
