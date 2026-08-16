import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_info');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/auth/me/');
      setUser(response.data);
      localStorage.setItem('user_info', JSON.stringify(response.data));
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      // Let the axios interceptor handle refresh or logout
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();

    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [fetchUserProfile]);

  const login = async (username, password) => {
    setError(null);
    try {
      const res = await apiClient.post('/token/', { username, password });
      const { access, refresh } = res.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      const meRes = await apiClient.get('/auth/me/');
      setUser(meRes.data);
      localStorage.setItem('user_info', JSON.stringify(meRes.data));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid username or password';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      const res = await apiClient.post('/auth/register/', { username, email, password });
      const { user: newUser, access, refresh } = res.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(newUser);
      localStorage.setItem('user_info', JSON.stringify(newUser));

      return { success: true };
    } catch (err) {
      let msg = 'Registration failed.';
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          msg = Object.entries(errors)
            .map(([field, errList]) => `${field}: ${Array.isArray(errList) ? errList.join(' ') : errList}`)
            .join(' | ');
        }
      }
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const demoLogin = async () => {
    return await login('demo', 'demo123');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    demoLogin,
    logout,
    refreshUser: fetchUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
