import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TicketProvider } from './context/TicketContext';
import { EmailProvider } from './context/EmailContext';
import { EmailTemplateProvider } from './context/EmailTemplateContext';
import Layout from './components/Layout';
import SubmitTicket from './pages/SubmitTicket';
import TicketConfirmation from './pages/TicketConfirmation';
import CheckStatus from './pages/CheckStatus';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import EmailSettings from './pages/EmailSettings';
import EmailTemplates from './pages/EmailTemplates';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <EmailProvider>
        <EmailTemplateProvider>
          <TicketProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<SubmitTicket />} />
                  <Route path="/confirmation" element={<TicketConfirmation />} />
                  <Route path="/status" element={<CheckStatus />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/email-settings" element={<EmailSettings />} />
                  <Route path="/admin/email-templates" element={<EmailTemplates />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </Router>
          </TicketProvider>
        </EmailTemplateProvider>
      </EmailProvider>
    </AuthProvider>
  );
}

export default App;