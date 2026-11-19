import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { isAxiosError } from "axios";
import type { User } from "../types";
import { USE_DEV_FIXTURES } from "../config/env";
import api from "../services/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (nextUser: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(!USE_DEV_FIXTURES);

  useEffect(() => {
    if (USE_DEV_FIXTURES) return;

    let active = true;

    api
      .get<User>("/auth/me")
      .then(({ data }) => {
        if (active) setUserState(data);
      })
      .catch((error: unknown) => {
        if (isAxiosError(error) && error.response?.status !== 401) {
          console.error("Could not verify the current session.", error);
        }
        if (active) setUserState(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<User>("/auth/login", { email, password });
    setUserState(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (!USE_DEV_FIXTURES) {
        await api.post("/auth/logout");
      }
    } finally {
      setUserState(null);
      localStorage.removeItem("token");
    }
  }, []);

  const setUser = useCallback((nextUser: User) => {
    setUserState(nextUser);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, setUser }),
    [user, loading, login, logout, setUser],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
