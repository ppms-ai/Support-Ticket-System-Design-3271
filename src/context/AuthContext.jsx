import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Create context
const AuthContext = createContext();

// Hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  // Check for existing auth on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setUser(authData.user);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error parsing saved admin session:', err);
        localStorage.removeItem('admin_auth');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Login function
  const login = async (credentials) => {
    const { email, password } = credentials;

    const { data, error } = await supabase
      .from('support_admins_hub2024')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      console.error('Login failed:', error);
      return false;
    }

    const userData = {
      email: data.email,
      name: data.name || 'Admin'
    };

    // ✅ Create base64 token using email and password
    const token = btoa(`${email}:${password}`);

    // ✅ Save user + token to localStorage
    localStorage.setItem(
      'admin_auth',
      JSON.stringify({
        user: userData,
        token
      })
    );

    setUser(userData);
    setIsAuthenticated(true);
    return true;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
