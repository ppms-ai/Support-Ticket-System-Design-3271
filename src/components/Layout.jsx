import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../context/AuthContext';

const { FiHeadphones, FiHome, FiSearch, FiSettings, FiLogOut, FiMail, FiEdit3 } = FiIcons;

const Layout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    window.location.href = '#/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-primary-500 rounded-lg">
                <SafeIcon icon={FiHeadphones} className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-800">Support Hub</span>
            </Link>

            <nav className="flex items-center space-x-6">
              {/* Show main navigation for non-admin routes OR admin login page */}
              {(!isAdminRoute || location.pathname === '/admin/login') && (
                <>
                  <Link
                    to="/"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === '/'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <SafeIcon icon={FiHome} className="h-4 w-4" />
                    <span>Submit</span>
                  </Link>
                  <Link
                    to="/status"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === '/status'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <SafeIcon icon={FiSearch} className="h-4 w-4" />
                    <span>Check Status</span>
                  </Link>
                </>
              )}

              {/* Show admin navigation for authenticated admin routes */}
              {isAuthenticated && isAdminRoute && location.pathname !== '/admin/login' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === '/admin/dashboard'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <SafeIcon icon={FiSettings} className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/admin/email-settings"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === '/admin/email-settings'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <SafeIcon icon={FiMail} className="h-4 w-4" />
                    <span>Email Settings</span>
                  </Link>
                  <Link
                    to="/admin/email-templates"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === '/admin/email-templates'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <SafeIcon icon={FiEdit3} className="h-4 w-4" />
                    <span>Templates</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <SafeIcon icon={FiLogOut} className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}

              {/* Show admin link for non-admin routes and non-authenticated users */}
              {!isAdminRoute && (
                <Link
                  to="/admin/login"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <SafeIcon icon={FiSettings} className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;