import { useCallback, useState } from "react";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  logout: () => void;
  setUser: (user: User) => void;
}

/**
 * Temporary bridge while the real auth flow is wired up.
 
 */
export function useAuth(): AuthState {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        return JSON.parse(raw) as User;
      }

      const dev: User = {
        id: "dev-resident-1",
        fullName: " Resident",
        email: "Whitedaniel@gmail.com",
        role: "resident",
      };
      localStorage.setItem("user", JSON.stringify(dev));
      return dev;
    } catch {
      return null;
    }
  });

  const setUser = useCallback((next: User) => {
    setUserState(next);
    localStorage.setItem("user", JSON.stringify(next));
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    localStorage.removeItem("user");
  }, []);

  return { user, loading: false, logout, setUser };
}