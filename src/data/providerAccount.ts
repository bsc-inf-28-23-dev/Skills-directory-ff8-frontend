import type { User } from "../types";
import type { ServiceProvider } from "../types/serviceProvider";

export function getProviderProfileId(user: User | null): string | undefined {
  if (user?.role !== "provider") return undefined;
  if (user.providerProfileId) return user.providerProfileId;

  // Keep the existing browser demo login connected to its sample business profile.
  return user.id === "dev-provider-1" ||
    user.email.toLowerCase() === "provider@test.com"
    ? "rapid-flow"
    : undefined;
}

export function getProviderProfileRouteId(user: User | null): string | undefined {
  if (user?.role !== "provider") return undefined;
  return getProviderProfileId(user) ?? user.id;
}

export function createProviderProfile(
  user: User,
  categories: string[],
  id = getProviderProfileRouteId(user) ?? user.id,
): ServiceProvider {
  const initials = user.fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return {
    id,
    name: user.displayName?.trim() || `${user.fullName.trim()}'s Business`,
    person: user.fullName,
    category: categories[0] ?? "Service provider",
    area: user.location ?? "",
    rating: 0,
    reviews: 0,
    photo: user.avatarUrl ?? undefined,
    initials: initials || "SP",
    services: [],
    quote: "",
    reviewer: "",
    date: "",
    position: [-13.9626, 33.7741],
  };
}
