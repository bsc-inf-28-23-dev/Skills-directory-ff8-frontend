import api from "./api";
import type { User } from "../types";

// The shape of the provider data returned by the backend
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

export const providerService = {
  /** GET /providers/me */
  async getMyProfile(): Promise<ProviderProfileData> {
    const { data } = await api.get<ProviderProfileData>("/providers/me");
    return data;
  },

  /** PATCH /providers/me */
  async updateMyProfile(payload: Partial<ProviderProfileData>): Promise<ProviderProfileData> {
    const { data } = await api.patch<ProviderProfileData>("/providers/me", payload);
    return data;
  },

  /** PUT /providers/me/skills */
  async updateMySkills(skills: string[]): Promise<void> {
    await api.put("/providers/me/skills", { skills });
  },

  /** GET /users/me */
  async getMyAccount(): Promise<User> {
    const { data } = await api.get<User>("/users/me");
    return data;
  },

  /** PATCH /users/me */
  async updateMyAccount(payload: Partial<User>): Promise<User> {
    const { data } = await api.patch<User>("/users/me", payload);
    return data;
  }
};