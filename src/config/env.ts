export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

/**
 * Development fixtures are only ever enabled in dev builds AND when explicitly
 * switched on. Production builds can never use them.
 */
export const USE_DEV_FIXTURES: boolean =
  import.meta.env.DEV && import.meta.env.VITE_USE_DEV_FIXTURES === "true";
