import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getLatestAnalysis } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      getLatestAnalysis().catch(() => {});
    }
    setLoading(false);
  }, []);

  const persistUser = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    if (data.success === false) throw new Error(data.error);
    persistUser(data.user, data.token);
    await getLatestAnalysis().catch(() => {});
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    if (data.success === false) throw new Error(data.error);
    persistUser(data.user, data.token);
    await getLatestAnalysis().catch(() => {});
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
