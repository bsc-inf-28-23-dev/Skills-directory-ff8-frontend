import { useCallback, useEffect, useState } from "react";
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
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        setUserState(JSON.parse(raw) as User);
      } else {
        const dev: User = {
          id: "dev-resident-1",
          fullName: " Resident",
          email: "Whitedaniel@gmail.com",
          role: "resident",
        };
        setUserState(dev);
        localStorage.setItem("user", JSON.stringify(dev));
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const setUser = useCallback((next: User) => {
    setUserState(next);
    localStorage.setItem("user", JSON.stringify(next));
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    localStorage.removeItem("user");
  }, []);

  return { user, loading, logout, setUser };
}