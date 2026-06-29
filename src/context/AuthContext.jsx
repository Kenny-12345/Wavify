/**
 * AuthContext.jsx
 * Authentication state via localStorage.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { authStorage } from '../services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = authStorage.loginUser(email, password);
      setUser(loggedUser);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const newUser = authStorage.registerUser(userData);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authStorage.clearUser();
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    const updated = authStorage.updateUser(updates);
    setUser(updated);
    return updated;
  }, []);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
