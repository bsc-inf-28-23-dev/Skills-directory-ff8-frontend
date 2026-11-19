import type { ProviderService } from "../types/providerService";

const STORAGE_KEY_PREFIX = "skillz-provider-services:";

function isProviderService(value: unknown): value is ProviderService {
  if (!value || typeof value !== "object") return false;

  const service = value as Record<string, unknown>;
  return (
    typeof service.id === "string" &&
    typeof service.providerId === "string" &&
    typeof service.name === "string" &&
    typeof service.category === "string" &&
    typeof service.subcategory === "string" &&
    typeof service.shortDescription === "string" &&
    typeof service.description === "string" &&
    Array.isArray(service.images) &&
    service.images.every((image) => typeof image === "string") &&
    typeof service.coverImageIndex === "number" &&
    ["fixed", "starting", "quotation"].includes(
      service.pricingModel as string,
    ) &&
    (service.priceMwk === null || typeof service.priceMwk === "number") &&
    typeof service.operatingLocation === "string" &&
    Array.isArray(service.coverageAreas) &&
    service.coverageAreas.every((area) => typeof area === "string") &&
    typeof service.travelsToCustomer === "boolean" &&
    typeof service.offeredAtPremises === "boolean" &&
    Array.isArray(service.workingDays) &&
    service.workingDays.every((day) => typeof day === "string") &&
    typeof service.openingTime === "string" &&
    typeof service.closingTime === "string" &&
    typeof service.availableForBooking === "boolean" &&
    ["draft", "pending", "active", "inactive", "rejected"].includes(
      service.status as string,
    ) &&
    (service.rejectionReason === undefined ||
      typeof service.rejectionReason === "string") &&
    (service.bookingCount === null ||
      typeof service.bookingCount === "number") &&
    (service.averageRating === null ||
      typeof service.averageRating === "number") &&
    typeof service.createdAt === "string" &&
    typeof service.updatedAt === "string"
  );
}

function getStorageKey(providerId: string) {
  return `${STORAGE_KEY_PREFIX}${encodeURIComponent(providerId)}`;
}

export function loadProviderServices(providerId: string): ProviderService[] {
  try {
    const stored = localStorage.getItem(getStorageKey(providerId));
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (
      !Array.isArray(parsed) ||
      !parsed.every(isProviderService) ||
      parsed.some((service) => service.providerId !== providerId)
    ) {
      throw new Error("Saved service data has an invalid format.");
    }

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Saved service data could not be read.", { cause: error });
    }
    throw error;
  }
}

export function saveProviderServices(
  providerId: string,
  services: ProviderService[],
): void {
  if (services.some((service) => service.providerId !== providerId)) {
    throw new Error("A service cannot be saved under a different provider.");
  }
  localStorage.setItem(getStorageKey(providerId), JSON.stringify(services));
}
