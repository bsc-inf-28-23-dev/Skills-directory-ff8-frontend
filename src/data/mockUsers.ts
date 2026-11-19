import type { User } from "../types";

export const mockUsers: Record<"resident" | "provider", User> = {
  resident: {
    id: "dev-resident-1",
    fullName: "Alex Phiri",
    displayName: "Alex",
    email: "resident@test.com",
    phone: "+265 991 000 001",
    role: "resident",
    location: "Lilongwe, Malawi",
    occupation: "Community resident",
    languages: ["English", "Chichewa"],
  },
  provider: {
    id: "dev-provider-1",
    fullName: "Sam Banda",
    displayName: "Rapid Flow Plumbing",
    email: "provider@test.com",
    phone: "+265 991 000 002",
    role: "provider",
    location: "Lilongwe, Malawi",
    occupation: "Plumber",
  },
};

export const mockUserCredentials = {
  resident: {
    email: "resident@test.com",
    password: "Resident123!",
  },
  provider: {
    email: "provider@test.com",
    password: "Provider123!",
  },
} as const;
