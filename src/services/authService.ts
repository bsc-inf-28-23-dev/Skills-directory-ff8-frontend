import api from "./api";
import type { User } from "../types";

export interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: string;
}

// The backend registers users with `name`, but the UI reads `user.fullName`.
// Make sure `fullName` always exists (as a string) so `.trim()` never crashes.
export function normalizeUser(raw: any): User {
  const fullName =
    raw?.fullName ??
    raw?.name ??
    raw?.displayName ??
    (typeof raw?.email === "string" ? raw.email.split("@")[0] : "") ??
    "";
  return { ...raw, fullName: String(fullName) } as User;
}

export async function registerUser(payload: RegisterPayload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function loginUser(payload: { email: string; password: string }) {
  const { data } = await api.post("/auth/login", payload);

  // The backend names the tokens `access_token` / `refresh_token`.
  const accessToken: string | undefined =
    data?.accessToken ?? data?.access_token ?? data?.token;
  const refreshToken: string | undefined =
    data?.refreshToken ?? data?.refresh_token;

  // api.ts reads `accessToken` from localStorage for every request.
  try {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  } catch {
    // storage may be unavailable; the app still works for this session
  }

  return {
    ...data,
    accessToken,
    refreshToken,
    user: data?.user ? normalizeUser(data.user) : data?.user,
  };
}