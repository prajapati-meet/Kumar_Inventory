import React, { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin } from '../api/endpoints';

const AuthContext = createContext(null);

/**
 * AuthContext provides:
 * - user: { username, fullName, role }
 * - isAuthenticated
 * - isAdmin
 * - login(credentials) → calls API, stores tokens
 * - logout() → clears storage
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const loginAction = useCallback(async (credentials) => {
    const res = await apiLogin(credentials);
    const { accessToken, refreshToken, username, fullName, role } = res.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    const userData = { username, fullName, role };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login: loginAction,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
