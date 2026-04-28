import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as apiLogin } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  // İlk yüklemede localStorage'dan oturumu geri yükle
  useEffect(() => {
    try {
      const t = localStorage.getItem('mubil_token');
      const u = localStorage.getItem('mubil_user');
      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u));
      }
    } catch {
      // bozuk JSON — sessizce temizle
      localStorage.removeItem('mubil_token');
      localStorage.removeItem('mubil_user');
    }
    setReady(true);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await apiLogin(username, password);
    const userObj = {
      ...data.user,
      mubilRole: data.mubilRole,
      mubilAccess: data.mubilAccess,
    };
    localStorage.setItem('mubil_token', data.token);
    localStorage.setItem('mubil_user',  JSON.stringify(userObj));
    setToken(data.token);
    setUser(userObj);
    return userObj;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mubil_token');
    localStorage.removeItem('mubil_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider içinde kullanılmalı');
  return ctx;
}
