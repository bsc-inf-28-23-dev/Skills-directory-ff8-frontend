import type { ServiceProvider } from "../types/serviceProvider";
import type {
  ProviderBusinessProfile,
  ProviderPortfolioItem,
  ProviderProfileDocument,
} from "../types/serviceProvider";

const DATABASE_NAME = "skillz-directory";
const STORE_NAME = "app-data";
const PROVIDERS_KEY = "providers";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPortfolioItem(value: unknown): value is ProviderPortfolioItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.description === "string" &&
    typeof item.imageUrl === "string"
  );
}

function isProfileDocument(value: unknown): value is ProviderProfileDocument {
  if (!value || typeof value !== "object") return false;
  const document = value as Record<string, unknown>;
  return (
    typeof document.id === "string" &&
    typeof document.name === "string" &&
    typeof document.mimeType === "string" &&
    typeof document.dataUrl === "string" &&
    typeof document.size === "number" &&
    ["unsubmitted", "pending", "verified", "rejected"].includes(
      String(document.status),
    ) &&
    (document.submittedAt === undefined || typeof document.submittedAt === "string") &&
    (document.feedback === undefined || typeof document.feedback === "string")
  );
}

function isBusinessProfile(value: unknown): value is ProviderBusinessProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.tagline === "string" &&
    isStringArray(profile.additionalCategories) &&
    (profile.yearsExperience === null || typeof profile.yearsExperience === "number") &&
    typeof profile.businessHours === "string" &&
    typeof profile.registrationDetails === "string" &&
    typeof profile.businessAddress === "string" &&
    typeof profile.city === "string" &&
    isStringArray(profile.areasServed) &&
    typeof profile.physicalPremises === "boolean" &&
    typeof profile.travelsToCustomer === "boolean" &&
    isStringArray(profile.skills) &&
    isStringArray(profile.qualifications) &&
    typeof profile.previousExperience === "string" &&
    (profile.businessLogo === undefined || typeof profile.businessLogo === "string") &&
    (profile.coverImage === undefined || typeof profile.coverImage === "string") &&
    (profile.publicPhone === undefined || typeof profile.publicPhone === "string") &&
    (profile.publicEmail === undefined || typeof profile.publicEmail === "string") &&
    typeof profile.showPublicPhone === "boolean" &&
    typeof profile.showPublicEmail === "boolean" &&
    Array.isArray(profile.portfolio) &&
    profile.portfolio.every(isPortfolioItem) &&
    ["unverified", "pending", "verified", "suspended"].includes(
      String(profile.verificationStatus),
    ) &&
    Array.isArray(profile.verificationDocuments) &&
    profile.verificationDocuments.every(isProfileDocument)
  );
}

function isProvider(value: unknown): value is ServiceProvider {
  if (!value || typeof value !== "object") return false;

  const provider = value as Record<string, unknown>;
  return (
    typeof provider.id === "string" &&
    typeof provider.name === "string" &&
    typeof provider.person === "string" &&
    typeof provider.category === "string" &&
    typeof provider.area === "string" &&
    typeof provider.rating === "number" &&
    typeof provider.reviews === "number" &&
    (provider.photo === undefined || typeof provider.photo === "string") &&
    typeof provider.initials === "string" &&
    Array.isArray(provider.services) &&
    provider.services.every((service) => typeof service === "string") &&
    typeof provider.quote === "string" &&
    typeof provider.reviewer === "string" &&
    typeof provider.date === "string" &&
    (provider.profile === undefined || isBusinessProfile(provider.profile)) &&
    Array.isArray(provider.position) &&
    provider.position.length === 2 &&
    provider.position.every((coordinate) => typeof coordinate === "number")
  );
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error("Provider storage is blocked by another page."));
  });
}

export async function loadProviders(): Promise<ServiceProvider[] | null> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(PROVIDERS_KEY);

    request.onsuccess = () => {
      const value: unknown = request.result;
      if (value === undefined) {
        resolve(null);
        return;
      }

      if (!Array.isArray(value) || !value.every(isProvider)) {
        reject(new Error("Saved provider data has an invalid format."));
        return;
      }

      resolve(value);
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("Loading provider data failed."));
    };
  });
}

export async function saveProviders(providers: ServiceProvider[]): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(providers, PROVIDERS_KEY);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("Saving provider data failed."));
    };
  });
}
