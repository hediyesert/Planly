import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { api } from "../api/apiClient";
import { clearAuth, getStoredUser, getToken, setAuth } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [ready, setReady] = useState(!!getToken());

  useEffect(() => {
    if (getToken() && !user) {
      setReady(true);
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    setAuth(data.token, data.user);
    setUser(data.user);
    setReady(true);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    setAuth(data.token, data.user);
    setUser(data.user);
    setReady(true);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setReady(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user && !!getToken(),
      login,
      register,
      logout,
      ready,
      setUser,
    }),
    [user, login, register, logout, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider gerekli");
  return ctx;
}
