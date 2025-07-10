import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

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

    // ✅ Create a simple "token" by encoding the email + password
    const token = btoa(`${email}:${password}`);

    // ✅ Store user and token in localStorage
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
