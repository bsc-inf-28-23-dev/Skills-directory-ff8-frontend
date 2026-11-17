import { useEffect, useState } from "react";
import type { User } from "../types";
import api from "../services/api";

export function useAuth() {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check localStorage first (for our Force Admin test)
    const localUser = localStorage.getItem("user");
    if (localUser) {
      try {
        setUserState(JSON.parse(localUser));
        setLoading(false);
        return;
      } catch (e) {}
    }

    // 2. If no local user, try the backend
    api.get("/auth/me")
      .then((res) => {
        setUserState(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch(() => setUserState(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    setUserState(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUserState(null);
      localStorage.removeItem("user");
    }
  };

  const setUser = (next: User) => {
    setUserState(next);
    localStorage.setItem("user", JSON.stringify(next));
  };

  return { user, loading, login, logout, setUser };
}