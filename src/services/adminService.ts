import api from "./api";
import { normalizeUser } from "./authService";
import type { User, ProviderSummary, UserRole } from "../types";

export interface AdminOverview {
  totalUsers: number;
  totalProviders: number;
  pendingListings: number;
  reportedUsers: number;
}

function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const wrapped = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(wrapped) ? (wrapped as T[]) : [];
}

function num(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return 0;
}

async function fetchOverview(): Promise<Record<string, any>> {
  const { data } = await api.get("/admin/overview");
  return (data ?? {}) as Record<string, any>;
}

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    const [raw, pending] = await Promise.all([
      fetchOverview(),
      api
        .get("/admin/providers/pending")
        .then((res) => toList(res.data).length)
        .catch(() => 0),
    ]);

    const stats = raw.dashboard ?? raw.usageReport ?? raw;
    return {
      totalUsers: num(stats.totalUsers, raw.users?.length),
      totalProviders: num(stats.totalProviders),
      pendingListings: num(stats.pendingListings, pending),
      reportedUsers: num(stats.reportedUsers, raw.reports?.length),
    };
  },

  async getAllUsers(): Promise<User[]> {
    const raw = await fetchOverview();
    return toList<User>(raw.users).map((user) => normalizeUser(user));
  },

  async getPendingProviders(): Promise<ProviderSummary[]> {
    const { data } = await api.get("/admin/providers/pending");
    return toList<ProviderSummary>(data);
  },

  async updateUserStatus(id: string, action: "suspend" | "ban"): Promise<void> {
    await api.patch(`/admin/users/${encodeURIComponent(id)}/status`, {
      status: action === "suspend" ? "suspended" : "banned",
    });
  },

  async approveProviderListing(id: string): Promise<void> {
    await api.patch(`/admin/providers/${encodeURIComponent(id)}/action`, {
      action: "approve",
    });
  },

  async rejectProviderListing(id: string): Promise<void> {
    await api.patch(`/admin/providers/${encodeURIComponent(id)}/action`, {
      action: "reject",
    });
  },

  async changeUserRole(id: string, role: UserRole): Promise<void> {
    await api.patch(`/admin/users/${encodeURIComponent(id)}/role`, { role });
  },

  async createAdmin(payload: {
    fullName: string;
    email: string;
    password?: string;
  }): Promise<User> {
    if (!payload.password || payload.password.length < 8) {
      throw new Error("Password is required and must be at least 8 characters.");
    }
    const { data } = await api.post("/admin/admins", {
      name: payload.fullName,
      email: payload.email,
      password: payload.password,
    });
    return normalizeUser(data?.user ?? data);
  },
};