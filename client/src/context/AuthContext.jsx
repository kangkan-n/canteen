import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('canteen_user') || 'null');
    if (stored?.token) {
      getMe().then(res => {
        setUser({ ...res.data.data.user, token: stored.token });
        setLoading(false);
      }).catch(() => {
        localStorage.removeItem('canteen_user');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    const data = { ...userData.user, token: userData.token };
    localStorage.setItem('canteen_user', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('canteen_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('canteen_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
