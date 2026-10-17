import type { Provider } from "../types/provider";

const DATABASE_NAME = "skillz-directory";
const STORE_NAME = "app-data";
const PROVIDERS_KEY = "providers";

function isProvider(value: unknown): value is Provider {
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

export async function loadProviders(): Promise<Provider[] | null> {
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

export async function saveProviders(providers: Provider[]): Promise<void> {
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
