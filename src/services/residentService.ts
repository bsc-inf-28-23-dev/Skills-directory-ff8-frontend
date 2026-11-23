import type {
  ConversationSummary,
  ProviderSummary,
  UpdateProfileInput,
  User,
} from "../types";
import api from "./api";
import { normalizeUser } from "./authService";

// List endpoints may return { data: [...], meta: {...} } or a plain array.
function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const wrapped = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(wrapped) ? (wrapped as T[]) : [];
}

/**
 * The backend has no GET /residents/me/recent-providers route (it returned 404),
 * so this returns an empty list until the server adds one.
 */
export async function getRecentlyViewedProviders(): Promise<ProviderSummary[]> {
  return [];
}

/** GET /conversations (exists). The limit is applied here, not sent to the server. */
export async function getRecentConversations(
  limit = 5,
): Promise<ConversationSummary[]> {
  const { data } = await api.get("/conversations");
  return toList<ConversationSummary>(data).slice(0, limit);
}

/**
 * PATCH /users/me (exists). The backend has no /residents/me route and calls the
 * name field `name`, so `fullName` is sent as `name`.
 */
export async function updateResidentProfile(
  input: UpdateProfileInput,
): Promise<User> {
  const { fullName, ...rest } = input as UpdateProfileInput & {
    fullName?: string;
  };
  const payload: Record<string, unknown> = { ...rest };
  if (fullName !== undefined) payload.name = fullName;

  const { data } = await api.patch("/users/me", payload);
  return normalizeUser(data?.user ?? data);
}

/** The backend has no avatar upload route (POST /residents/me/avatar returned 404). */
export async function uploadAvatar(_file: File): Promise<User> {
  throw new Error("Avatar upload is not available yet.");
}