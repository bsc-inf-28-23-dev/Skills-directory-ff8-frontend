import api from "./api";
import type { User, ProviderSummary } from "../types";

export interface AdminOverview {
  totalUsers: number;
  totalProviders: number;
  pendingListings: number;
  reportedUsers: number;
}

export const adminService = {
  getOverview: async (): Promise<AdminOverview> => {
    const { data } = await api.get<AdminOverview>("/admin/overview");
    return data;
  },
  
  getPendingProviders: async (): Promise<ProviderSummary[]> => {
    // Assuming GET /admin/providers returns a list
    const { data } = await api.get<ProviderSummary[]>("/admin/providers"); 
    return data;
  },

  getAllUsers: async (): Promise<User[]> => {
    // Assuming GET /admin/users returns a list
    const { data } = await api.get<User[]>("/admin/users");
    return data;
  },

  manageProviderAction: async (id: string, action: "approve" | "reject" | "delete") => {
    await api.patch(`/admin/providers/${id}/action`, { action });
  },

  updateUserStatus: async (id: string, status: "active" | "suspended" | "banned") => {
    await api.patch(`/admin/users/${id}/status`, { status });
  },

  changeUserRole: async (id: string, role: "resident" | "provider" | "admin") => {
    await api.patch(`/admin/users/${id}/role`, { role });
  },
};