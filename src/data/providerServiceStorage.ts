import type {
  ProviderService,
  ProviderServiceStatus,
} from "../types/providerService";

const STORAGE_KEY_PREFIX = "skillz-provider-services:";
const DATABASE_NAME = "skillz-directory";
const DATABASE_VERSION = 1;
const STORE_NAME = "providerServices";

interface StoredProviderServices {
  ownerId: string;
  services: ProviderService[];
}

function getStorageKey(ownerId: string) {
  return `${STORAGE_KEY_PREFIX}${encodeURIComponent(ownerId)}`;
}

function isStatus(value: unknown): value is ProviderServiceStatus {
  return ["draft", "pending", "active", "inactive", "rejected"].includes(
    value as string,
  );
}

function normalizeService(
  value: unknown,
  ownerId: string,
  providerId: string,
): ProviderService | undefined {
  if (!value || typeof value !== "object") return undefined;
  const service = value as Record<string, unknown>;
  const legacyImages = Array.isArray(service.images)
    ? service.images.filter((image): image is string => typeof image === "string")
    : [];
  const legacyCoverIndex =
    typeof service.coverImageIndex === "number" ? service.coverImageIndex : 0;
  const imageUrl =
    typeof service.imageUrl === "string"
      ? service.imageUrl
      : legacyImages[legacyCoverIndex] ?? legacyImages[0] ?? "";

  if (
    typeof service.id !== "string" ||
    (service.providerId !== ownerId && service.providerId !== providerId) ||
    typeof service.name !== "string" ||
    typeof service.category !== "string" ||
    typeof service.shortDescription !== "string" ||
    !isStatus(service.status) ||
    typeof service.createdAt !== "string" ||
    typeof service.updatedAt !== "string" ||
    (service.rejectionReason !== undefined &&
      typeof service.rejectionReason !== "string") ||
    (service.averageRating !== undefined &&
      service.averageRating !== null &&
      typeof service.averageRating !== "number")
  ) {
    return undefined;
  }

  return {
    id: service.id,
    providerId,
    name: service.name,
    category: service.category,
    shortDescription: service.shortDescription,
    imageUrl,
    status: service.status,
    ...(typeof service.rejectionReason === "string"
      ? { rejectionReason: service.rejectionReason }
      : {}),
    averageRating:
      typeof service.averageRating === "number" ? service.averageRating : null,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "ownerId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Service storage could not be opened.", { cause: request.error }));
  });
}

function readStoredServices(
  database: IDBDatabase,
  ownerId: string,
): Promise<ProviderService[] | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(ownerId);
    request.onsuccess = () => {
      const record = request.result as StoredProviderServices | undefined;
      resolve(record?.services);
    };
    request.onerror = () =>
      reject(new Error("Saved services could not be read.", { cause: request.error }));
  });
}

function writeStoredServices(
  database: IDBDatabase,
  ownerId: string,
  services: ProviderService[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ ownerId, services });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(new Error("Service changes could not be saved.", { cause: transaction.error }));
    transaction.onabort = () =>
      reject(new Error("Service changes could not be saved.", { cause: transaction.error }));
  });
}

export async function loadProviderServices(
  ownerId: string,
  providerId: string,
): Promise<ProviderService[]> {
  const database = await openDatabase();
  const storedServices = await readStoredServices(database, ownerId);
  if (storedServices) {
    const normalized = storedServices.map((service) =>
      normalizeService(service, ownerId, providerId),
    );
    if (normalized.some((service) => !service)) {
      throw new Error("Saved service data has an invalid format.");
    }
    return normalized as ProviderService[];
  }

  const legacy = localStorage.getItem(getStorageKey(ownerId));
  if (!legacy) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(legacy);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Saved service data could not be read.", { cause: error });
    }
    throw error;
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Saved service data has an invalid format.");
  }
  const normalized = parsed.map((service) =>
    normalizeService(service, ownerId, providerId),
  );
  if (normalized.some((service) => !service)) {
    throw new Error("Saved service data has an invalid format.");
  }

  const services = normalized as ProviderService[];
  await writeStoredServices(database, ownerId, services);
  localStorage.removeItem(getStorageKey(ownerId));
  return services;
}

export async function saveProviderServices(
  ownerId: string,
  providerId: string,
  services: ProviderService[],
): Promise<void> {
  if (services.some((service) => service.providerId !== providerId)) {
    throw new Error("A service cannot be saved under a different provider.");
  }
  const database = await openDatabase();
  await writeStoredServices(database, ownerId, services);
}
