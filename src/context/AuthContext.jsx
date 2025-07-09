import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for saved authentication on component mount
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setIsAuthenticated(true);
        setUser(authData.user);
      } catch (error) {
        console.error('Error parsing saved auth:', error);
        localStorage.removeItem('admin_auth');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = (credentials) => {
    // IMPORTANT: Change these credentials before going live!
    // For production, consider using environment variables or a more secure method
    if (credentials.email === 'admin@support.com' && credentials.password === 'admin123') {
      const userData = {
        email: credentials.email,
        name: 'Admin User'
      };
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('admin_auth', JSON.stringify({ user: userData }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('admin_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};