import React, { useState, useEffect } from 'react';
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
    testEmailConfiguration,
  } = useEmail();

  // keep local form state in sync with context on mount + when context changes
  const [localConfig, setLocalConfig] = useState({
    fromName: '',
    fromEmail: '',
    emailService: 'resend',
    apiKey: '',
    smtpConfig: { host: '', port: 587, user: '', password: '' },
    notificationEmails: [],
  });
  useEffect(() => {
    setLocalConfig({
      fromName:    emailConfig.fromName    || '',
      fromEmail:   emailConfig.fromEmail   || '',
      emailService:emailConfig.emailService|| 'resend',
      apiKey:      emailConfig.apiKey      || '',
      smtpConfig: {
        host:      emailConfig.smtpConfig.host     || '',
        port:      emailConfig.smtpConfig.port     || 587,
        user:      emailConfig.smtpConfig.user     || '',
        password:  emailConfig.smtpConfig.password || '',
      },
      notificationEmails: [...(emailConfig.notificationEmails || [])],
    });
  }, [emailConfig]);

  const [newEmail, setNewEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const updateField = (key, value) => {
    setLocalConfig(cfg => ({ ...cfg, [key]: value }));
  };
  const updateSmtp   = (key, value) => {
    setLocalConfig(cfg => ({
      ...cfg,
      smtpConfig: { ...cfg.smtpConfig, [key]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTestResult(null);
    try {
      // call context upsert
      await saveEmailConfig(localConfig);
      setTestResult({ success: true, message: 'Configuration saved.' });
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // if you want to persist before testing, uncomment:
      // await saveEmailConfig(localConfig);
      await testEmailConfiguration();
      setTestResult({ success: true, message: 'Test email sent!' });
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddEmail = () => {
    if (!newEmail) return;
    setLocalConfig(cfg => ({
      ...cfg,
      notificationEmails: [...cfg.notificationEmails, newEmail]
    }));
    setNewEmail('');
  };

  const handleRemoveEmail = addr => {
    setLocalConfig(cfg => ({
      ...cfg,
      notificationEmails: cfg.notificationEmails.filter(e => e !== addr)
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
                ? 'bg-green-100 border-green-300 text-green-800'
                : 'bg-red-100 border-red-300 text-red-800'
            }`}
          >
            <SafeIcon icon={testResult.success ? FiCheck : FiX} className="h-5 w-5" />
            <span>{testResult.message}</span>
          </motion.div>
        )}

        {/* Notification Recipients */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Notification Recipients</h2>
          {localConfig.notificationEmails.map((addr, i) => (
            <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg mb-2">
              <span className="text-slate-700">{addr}</span>
              <button onClick={() => handleRemoveEmail(addr)} className="text-red-600">
                <FiTrash2 />
              </button>
            </div>
          ))}
          <div className="flex space-x-2 mt-2">
            <input
              type="email"
              placeholder="Enter email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddEmail()}
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleAddEmail}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FiPlus className="mr-1" />
              Add
            </button>
          </div>
        </div>

        {/* Sender Info */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">From Name</label>
            <input
              type="text"
              value={localConfig.fromName}
              onChange={e => updateField('fromName', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-1">From Email</label>
            <input
              type="email"
              value={localConfig.fromEmail}
              onChange={e => updateField('fromEmail', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Email Service */}
        <div className="mb-8">
          <label className="block mb-2">Provider</label>
          <select
            value={localConfig.emailService}
            onChange={e => {
              updateField('emailService', e.target.value);
              updateEmailService(e.target.value);
            }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="resend">Resend</option>
            <option value="sendgrid">SendGrid</option>
            <option value="smtp">SMTP</option>
          </select>
        </div>

        {/* API Key (for Resend/SendGrid) */}
        {localConfig.emailService !== 'smtp' && (
          <div className="mb-8">
            <label className="block mb-2">API Key</label>
            <input
              type="password"
              value={localConfig.apiKey}
              onChange={e => updateField('apiKey', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        )}

        {/* SMTP Config */}
        {localConfig.emailService === 'smtp' && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {['host','port','user','password'].map((k,i) => (
              <input
                key={k}
                type={k==='port'?'number':'text'}
                placeholder={k.charAt(0).toUpperCase()+k.slice(1)}
                value={localConfig.smtpConfig[k]}
                onChange={e => updateSmtp(k, k==='port'?+e.target.value:e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
            ))}
          </div>
        )}

        {/* Save & Test Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg flex items-center"
          >
            {isSaving ? 'Saving…' : <><FiSave className="mr-1"/> Save Configuration</>}
          </button>
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center"
          >
            {isTesting ? 'Testing…' : <><FiSend className="mr-1"/> Send Test Email</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailSettings;
