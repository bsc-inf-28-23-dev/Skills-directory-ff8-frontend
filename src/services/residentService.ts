import type {
  ConversationSummary,
  ProviderSummary,
  UpdateProfileInput,
  User,
} from "../types";
import api from "./api";

/** GET /residents/me/recent-providers */
export async function getRecentlyViewedProviders(): Promise<ProviderSummary[]> {
  const { data } = await api.get<ProviderSummary[]>("/residents/me/recent-providers");
  return data;
}

/** GET /conversations?limit=5 */
export async function getRecentConversations(limit = 5): Promise<ConversationSummary[]> {
  const { data } = await api.get<ConversationSummary[]>("/conversations", {
    params: { limit },
  });
  return data;
}

/** PATCH /residents/me — updates profile bio fields */
export async function updateResidentProfile(input: UpdateProfileInput): Promise<User> {
  const { data } = await api.patch<User>("/residents/me", input);
  return data;
}

/** POST /residents/me/avatar — multipart file upload */
export async function uploadAvatar(file: File): Promise<User> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<User>("/residents/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}