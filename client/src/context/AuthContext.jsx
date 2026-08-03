import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/user/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const verifyEmail = async (verifyToken) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/verify-email/${verifyToken}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Verification failed');
      }
      // Save token and user details
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const forgotPassword = async (email) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to request reset link');
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (resetToken, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Password reset failed');
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Profile update failed');
      }
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        verifyEmail,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        API_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
