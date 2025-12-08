import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    setLoading(false);
  };

  const login = async (email, password, userType) => {
    try {
      const response = await api.post('/auth/login', { email, password, userType });
      const { token, user } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userType', userType);
      localStorage.setItem('user', JSON.stringify(user));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
