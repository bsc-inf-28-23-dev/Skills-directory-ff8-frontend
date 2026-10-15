import { USE_DEV_FIXTURES } from "../config/env";
import type {
  ConversationSummary,
  ProviderSummary,
  UpdateProfileInput,
  User,
} from "../types";
import { apiClient } from "./apiClient";
import {
  delay,
  fixtureConversations,
  fixtureProviders,
  fixtureUser,
} from "./devFixtures";

let devUser: User = { ...fixtureUser };

/** GET /residents/me/recent-providers */
export async function getRecentlyViewedProviders(): Promise<ProviderSummary[]> {
  if (USE_DEV_FIXTURES) return delay(fixtureProviders);
  const { data } = await apiClient.get<ProviderSummary[]>(
    "/residents/me/recent-providers",
  );
  return data;
}

/** GET /conversations?limit=5 */
export async function getRecentConversations(
  limit = 5,
): Promise<ConversationSummary[]> {
  if (USE_DEV_FIXTURES) return delay(fixtureConversations.slice(0, limit));
  const { data } = await apiClient.get<ConversationSummary[]>("/conversations", {
    params: { limit },
  });
  return data;
}

/** PATCH /residents/me — updates profile bio fields (not avatar) */
export async function updateResidentProfile(
  input: UpdateProfileInput,
): Promise<User> {
  if (USE_DEV_FIXTURES) {
    devUser = { ...devUser, ...input };
    return delay(devUser);
  }
  const { data } = await apiClient.patch<User>("/residents/me", input);
  return data;
}

/** POST /residents/me/avatar — multipart file upload; returns updated User */
export async function uploadAvatar(file: File): Promise<User> {
  if (USE_DEV_FIXTURES) {
    const url = URL.createObjectURL(file);
    devUser = { ...devUser, avatarUrl: url };
    return delay(devUser, 400);
  }
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<User>("/residents/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}