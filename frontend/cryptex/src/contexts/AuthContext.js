import { createContext, useContext, useState, useEffect } from "react";
import { api, setupApiInterceptors } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user?.access) {
      api.defaults.headers.common["Authorization"] = `Bearer ${user.access}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Setup interceptor once, passing getter/setter for user
  useEffect(() => {
    setupApiInterceptors(() => user, setUser);
  }, [user]);

  const login = (userData) => setUser(userData);
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
