export interface SavedService {
  providerId: string;
  service: string;
}

function isSavedService(value: unknown): value is SavedService {
  return (
    typeof value === "object" &&
    value !== null &&
    "providerId" in value &&
    typeof value.providerId === "string" &&
    "service" in value &&
    typeof value.service === "string"
  );
}

function storageKey(userId: string) {
  return `saved-services:${userId}`;
}

export function loadSavedServices(userId: string): SavedService[] {
  const saved = localStorage.getItem(storageKey(userId));
  if (!saved) return [];

  const parsed: unknown = JSON.parse(saved);
  if (!Array.isArray(parsed) || !parsed.every(isSavedService)) {
    throw new Error("Saved services data has an invalid format.");
  }

  return parsed;
}

export function saveSavedServices(
  userId: string,
  services: SavedService[],
): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(services));
}
