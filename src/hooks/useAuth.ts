import { useCallback, useSyncExternalStore } from "react";
import type { User } from "../types";
import { USE_DEV_FIXTURES } from "../config/env";

interface AuthState {
  user: User | null;
  loading: boolean;
  logout: () => void;
  setUser: (user: User, accessToken?: string) => void;
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    const savedUser = JSON.parse(raw) as User;
    if (
      !USE_DEV_FIXTURES &&
      (savedUser.id.startsWith("dev-") ||
        savedUser.email === "resident@test.com" ||
        savedUser.email === "provider@test.com" ||
        savedUser.email.endsWith("@example.invalid"))
    ) {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      return null;
    }

    return savedUser;
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    return null;
  }
}

let currentUser = readStoredUser();
const subscribers = new Set<() => void>();

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function getSnapshot() {
  return currentUser;
}

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

export function useAuth(): AuthState {
  const user = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setUser = useCallback((next: User, accessToken?: string) => {
    localStorage.setItem("user", JSON.stringify(next));
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }
    currentUser = next;
    notifySubscribers();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    currentUser = null;
    notifySubscribers();
  }, []);

  return { user, loading: false, logout, setUser };
}