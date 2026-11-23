import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const saved = localStorage.getItem("token");
    if (saved && !sessionStorage.getItem("token")) sessionStorage.setItem("token", saved);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    async function restore() {
      try {
        if (sessionStorage.getItem("token")) {
          const { data } = await api.get("/auth/me");
          if (active) setUser(data.user);
        }
      } catch {
        if (active) setError("Please sign in to continue.");
      } finally {
        if (active) setRestoring(false);
      }
    }
    restore();
    return () => { active = false; };
  }, []);

  async function authenticate(endpoint, payload) {
    setLoading(true);
    try {
      const { data } = await api.post(endpoint, payload);
      sessionStorage.setItem("token", data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }

  const login = (email, password) => authenticate("/auth/login", { email, password });
  const register = payload => authenticate("/auth/register", payload);

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error, setError }}>
      {restoring ? <p role="status" className="p-6">Opening campus events…</p> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
