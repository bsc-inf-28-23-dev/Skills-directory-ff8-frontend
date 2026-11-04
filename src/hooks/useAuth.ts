import { useCallback, useSyncExternalStore } from "react";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  logout: () => void;
  setUser: (user: User) => void;
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    const savedUser = JSON.parse(raw) as User;
    if (savedUser.id === "dev-resident-1") {
      localStorage.removeItem("user");
      return null;
    }

    return savedUser;
  } catch {
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

  const setUser = useCallback((next: User) => {
    localStorage.setItem("user", JSON.stringify(next));
    currentUser = next;
    notifySubscribers();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    currentUser = null;
    notifySubscribers();
  }, []);

  return { user, loading: false, logout, setUser };
}