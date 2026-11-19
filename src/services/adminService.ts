import api from "./api";
import type { User, ProviderSummary, UserRole } from "../types";

export interface AdminOverview {
  totalUsers: number;
  totalProviders: number;
  pendingListings: number;
  reportedUsers: number;
}

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    const { data } = await api.get<AdminOverview>("/admin/dashboard");
    return data;
  },

  async getAllUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>("/admin/users");
    return data;
  },

  async getPendingProviders(): Promise<ProviderSummary[]> {
    const { data } = await api.get<ProviderSummary[]>("/admin/providers/pending");
    return data;
  },

  async updateUserStatus(id: string, action: "suspend" | "ban"): Promise<void> {
    await api.patch(`/admin/users/${id}/${action}`);
  },

  async approveProviderListing(id: string): Promise<void> {
    await api.patch(`/admin/providers/${id}/approve`);
  },

  async rejectProviderListing(id: string): Promise<void> {
    await api.patch(`/admin/providers/${id}/reject`);
  },

  async changeUserRole(id: string, role: UserRole): Promise<void> {
    await api.patch(`/admin/users/${id}/role`, { role });
  },

  // NEW: Required by AdminDashboardPage.tsx
  async createAdmin(payload: { fullName: string; email: string; password?: string }): Promise<User> {
    const { data } = await api.post<User>("/admin/admins", payload);
    return data;
  },
};