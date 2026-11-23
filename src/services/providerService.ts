import api from "./api";
import { normalizeUser } from "./authService";
import type { User } from "../types";
import type { ServiceProvider } from "../types/serviceProvider";

export interface ProviderProfileData {
  id: string;
  businessName: string;
  contactPerson: string;
  category: string;
  serviceArea: string;
  about: string;
  skills: string[];
  photoUrl?: string;
  rating?: number;
  reviewCount?: number;
}

// The backend returns { data: [...], meta: {...} } for list endpoints.
// This accepts either that shape or a plain array, and never returns a non-array.
function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const wrapped = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(wrapped) ? (wrapped as T[]) : [];
}

export async function getProviders(): Promise<ServiceProvider[]> {
  const { data } = await api.get("/providers");
  return toList<ServiceProvider>(data);
}

export async function updateProvider(
  providerId: string,
  provider: ServiceProvider,
): Promise<ServiceProvider> {
  const { data } = await api.patch<ServiceProvider>(
    `/providers/${encodeURIComponent(providerId)}`,
    provider,
  );
  return data;
}

export const providerService = {
  async getMyProfile(): Promise<ProviderProfileData> {
    const { data } = await api.get<ProviderProfileData>("/providers/me");
    return data;
  },

  async updateMyProfile(
    payload: Partial<ProviderProfileData>,
  ): Promise<ProviderProfileData> {
    const { data } = await api.patch<ProviderProfileData>(
      "/providers/me",
      payload,
    );
    return data;
  },

  async updateMySkills(skills: string[]): Promise<void> {
    await api.put("/providers/me/skills", { skills });
  },

  async getMyAccount(): Promise<User> {
    const { data } = await api.get("/users/me");
    return normalizeUser(data);
  },

  async updateMyAccount(payload: Partial<User>): Promise<User> {
    const { data } = await api.patch<User>("/users/me", payload);
    return data;
  },
};