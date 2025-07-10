import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useEmail } from '../context/EmailContext';

const { FiMail, FiPlus, FiTrash2, FiSave, FiSend, FiCheck, FiX } = FiIcons;

const EmailSettings = () => {
  const {
    emailConfig,
    saveEmailConfig,
    addNotificationEmail,
    removeNotificationEmail,
    updateEmailService,
    testEmailConfiguration
  } = useEmail();

  // ✅ Safe default state setup
  const [newEmail, setNewEmail] = useState('');
  const [localConfig, setLocalConfig] = useState(() => ({
    fromName: '',
    fromEmail: '',
    emailService: 'resend',
    apiKey: '',
    smtpConfig: {
      host: '',
      port: 587,
      user: '',
      password: ''
    },
    notificationEmails: [],
    ...emailConfig // safely overwrite if defined
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true);
      await saveEmailConfig(localConfig);
      setTestResult({ success: true, message: 'Email configuration saved successfully!' });
    } catch (error) {
      setTestResult({ success: false, message: 'Error saving configuration: ' + error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEmail = () => {
    if (newEmail && !localConfig.notificationEmails.includes(newEmail)) {
      setLocalConfig((prev) => ({
        ...prev,
        notificationEmails: [...prev.notificationEmails, newEmail]
      }));
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setLocalConfig((prev) => ({
      ...prev,
      notificationEmails: prev.notificationEmails.filter((email) => email !== emailToRemove)
    }));
  };

  const handleTestEmail = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      await testEmailConfiguration();
      setTestResult({ success: true, message: 'Test email sent successfully! Check your inbox.' });
    } catch (error) {
      setTestResult({ success: false, message: 'Test email failed: ' + error.message });
    } finally {
      setIsTesting(false);
    }
  };

  const updateConfigField = (field, value) => {
    setLocalConfig((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSmtpConfig = (field, value) => {
    setLocalConfig((prev) => ({
      ...prev,
      smtpConfig: {
        ...prev.smtpConfig,
        [field]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-soft p-8"
      >
        <div className="flex items-center space-x-3 mb-8">
          <SafeIcon icon={FiMail} className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-slate-800">Email Configuration</h1>
        </div>

        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-center space-x-2 ${
              testResult.success
                ? 'bg-green-100 border border-green-300 text-green-800'
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}
          >
            <SafeIcon icon={testResult.success ? FiCheck : FiX} className="h-5 w-5" />
            <span>{testResult.message}</span>
          </motion.div>
        )}

        {/* Notification Emails */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Notification Recipients</h2>
          <div className="space-y-3 mb-4">
            {(localConfig.notificationEmails || []).map((email, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-50 rounded-lg p-3"
              >
                <span className="text-slate-700">{email}</span>
                <button
                  onClick={() => handleRemoveEmail(email)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
            />
            <button
              onClick={handleAddEmail}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Sender Info */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Sender Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From Name</label>
              <input
                type="text"
                value={localConfig.fromName}
                onChange={(e) => updateConfigField('fromName', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">From Email</label>
              <input
                type="email"
                value={localConfig.fromEmail}
                onChange={(e) => updateConfigField('fromEmail', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Email Service Config */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Email Service</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Provider</label>
              <select
                value={localConfig.emailService}
                onChange={(e) => updateConfigField('emailService', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="resend">Resend (Recommended)</option>
                <option value="sendgrid">SendGrid</option>
                <option value="smtp">Custom SMTP</option>
              </select>
            </div>

            {/* API Key field */}
            {localConfig.emailService !== 'smtp' && (
              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input
                  type="password"
                  value={localConfig.apiKey}
                  onChange={(e) => updateConfigField('apiKey', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            )}

            {/* SMTP Fields */}
            {localConfig.emailService === 'smtp' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="SMTP Host"
                  value={localConfig.smtpConfig.host}
                  onChange={(e) => updateSmtpConfig('host', e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  placeholder="Port"
                  type="number"
                  value={localConfig.smtpConfig.port}
                  onChange={(e) => updateSmtpConfig('port', parseInt(e.target.value))}
                  className="px-4 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  placeholder="Username"
                  value={localConfig.smtpConfig.user}
                  onChange={(e) => updateSmtpConfig('user', e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  placeholder="Password"
                  type="password"
                  value={localConfig.smtpConfig.password}
                  onChange={(e) => updateSmtpConfig('password', e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save & Test */}
        <div className="flex gap-4">
          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="h-5 w-5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>

          <button
            onClick={handleTestEmail}
            disabled={isTesting}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
          >
            {isTesting ? (
              <span>Testing...</span>
            ) : (
              <>
                <SafeIcon icon={FiSend} className="h-5 w-5" />
                <span>Send Test Email</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailSettings;
