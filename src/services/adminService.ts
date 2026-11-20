import api from "./api";
import type { User, ProviderSummary, UserRole } from "../types";
import { USE_DEV_FIXTURES } from "../config/env";
import { mockUsers } from "../data/mockUsers";
import { fixtureProviders } from "./devFixtures";
import { delay } from "./devFixtures";

export interface AdminOverview {
  totalUsers: number;
  totalProviders: number;
  pendingListings: number;
  reportedUsers: number;
}

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    if (USE_DEV_FIXTURES) {
      return delay({
        totalUsers: 248,
        totalProviders: 86,
        pendingListings: 12,
        reportedUsers: 3,
      });
    }
    const { data } = await api.get<AdminOverview>("/admin/dashboard");
    return data;
  },

  async getAllUsers(): Promise<User[]> {
    if (USE_DEV_FIXTURES) {
      return delay([
        mockUsers.resident,
        mockUsers.provider,
        {
          id: "dev-user-4",
          fullName: "Naledi Mokoena",
          email: "naledi@test.com",
          phone: "+265 999 123 456",
          role: "resident",
          createdAt: "2026-11-15T09:30:00.000Z",
        },
        {
          id: "dev-user-5",
          fullName: "Brightline Electrical",
          email: "brightline@test.com",
          phone: "+265 888 654 321",
          role: "provider",
          createdAt: "2026-11-12T10:15:00.000Z",
        },
      ]);
    }
    const { data } = await api.get<User[]>("/admin/users");
    return data;
  },

  async getPendingProviders(): Promise<ProviderSummary[]> {
    if (USE_DEV_FIXTURES) {
      return delay(fixtureProviders);
    }
    const { data } = await api.get<ProviderSummary[]>("/admin/providers/pending");
    return data;
  },

  async updateUserStatus(id: string, action: "suspend" | "ban"): Promise<void> {
    if (USE_DEV_FIXTURES) return delay(undefined);
    await api.patch(`/admin/users/${id}/${action}`);
  },

  async approveProviderListing(id: string): Promise<void> {
    if (USE_DEV_FIXTURES) return delay(undefined);
    await api.patch(`/admin/providers/${id}/approve`);
  },

  async rejectProviderListing(id: string): Promise<void> {
    if (USE_DEV_FIXTURES) return delay(undefined);
    await api.patch(`/admin/providers/${id}/reject`);
  },

  async changeUserRole(id: string, role: UserRole): Promise<void> {
    if (USE_DEV_FIXTURES) return delay(undefined);
    await api.patch(`/admin/users/${id}/role`, { role });
  },

  // NEW: Required by AdminDashboardPage.tsx
  async createAdmin(payload: { fullName: string; email: string; password?: string }): Promise<User> {
    const { data } = await api.post<User>("/admin/admins", payload);
    return data;
  },
};