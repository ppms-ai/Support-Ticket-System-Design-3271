import React, { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMail, FiPlus, FiTrash2, FiSave, FiSend, FiCheck, FiX } = FiIcons;

const EmailSettings = () => {
  const [localConfig, setLocalConfig] = useState({
    notificationEmails: [],
    fromName: '',
    fromEmail: '',
    emailService: 'resend', // options: resend, sendgrid, smtp
    apiKey: '',
    smtpConfig: {
      host: '',
      port: 587,
      secure: false,
      user: '',
      password: ''
    }
  });
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Load existing config on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('email_config_hub2024')
          .select('*')
          .eq('id', 'email_settings')
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setLocalConfig({
            notificationEmails: data.notification_recipients || [],
            fromName: data.from_name || '',
            fromEmail: data.from_email || '',
            emailService: data.email_service || 'resend',
            apiKey: data.api_key || '',
            smtpConfig: {
              host: data.smtp_host || '',
              port: data.smtp_port || 587,
              secure: data.smtp_secure || false,
              user: data.smtp_user || '',
              password: data.smtp_password || ''
            }
          });
        }
      } catch (err) {
        console.error('Error loading email config:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setTestResult(null);
    try {
      // get current user for RLS
      const {
        data: { user },
        error: userErr
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error('Not authenticated');

      const payload = {
        id: 'email_settings',
        user_id: user.id,
        user_email: user.email,
        notification_recipients: localConfig.notificationEmails,
        from_name: localConfig.fromName,
        from_email: localConfig.fromEmail,
        email_service: localConfig.emailService,
        api_key: localConfig.apiKey,
        smtp_host: localConfig.smtpConfig.host,
        smtp_port: localConfig.smtpConfig.port,
        smtp_secure: localConfig.smtpConfig.secure,
        smtp_user: localConfig.smtpConfig.user,
        smtp_password: localConfig.smtpConfig.password,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('email_config_hub2024')
        .upsert(payload);
      if (error) throw error;

      setTestResult({ success: true, message: 'Email configuration saved successfully!' });
    } catch (err) {
      console.error(err);
      setTestResult({ success: false, message: 'Error saving configuration: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      if (!localConfig.notificationEmails.length) {
        throw new Error('Add at least one notification recipient first');
      }
      const to = localConfig.notificationEmails[0];
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          to,
          from: localConfig.fromEmail,
          subject: 'Test Notification',
          message: 'This is a test email from your Support Hub.'
        }
      });
      if (error) throw error;
      setTestResult({ success: true, message: 'Test email sent! Check your inbox.' });
    } catch (err) {
      console.error(err);
      setTestResult({ success: false, message: 'Test email failed: ' + err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddEmail = () => {
    if (newEmail && !localConfig.notificationEmails.includes(newEmail)) {
      setLocalConfig(prev => ({
        ...prev,
        notificationEmails: [...prev.notificationEmails, newEmail]
      }));
      setNewEmail('');
    }
  };
  const handleRemoveEmail = (email) => {
    setLocalConfig(prev => ({
      ...prev,
      notificationEmails: prev.notificationEmails.filter(e => e !== email)
    }));
  };

  const updateField = (field, value) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };
  const updateSmtpField = (field, value) => {
    setLocalConfig(prev => ({
      ...prev,
      smtpConfig: { ...prev.smtpConfig, [field]: value }
    }));
  };

  if (isLoading) return <div className="p-8 text-center">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-soft p-8"
      >
        {/* header */}
        <div className="flex items-center space-x-3 mb-8">
          <SafeIcon icon={FiMail} className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-slate-800">Email Configuration</h1>
        </div>

        {/* result banner */}
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
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Notification Recipients
          </h2>
          <div className="space-y-3 mb-4">
            {localConfig.notificationEmails.map((email, i) => (
              <div
                key={i}
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
              onChange={e => setNewEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
              onKeyDown={e => e.key === 'Enter' && handleAddEmail()}
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
                onChange={e => updateField('fromName', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">From Email</label>
              <input
                type="email"
                value={localConfig.fromEmail}
                onChange={e => updateField('fromEmail', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Email Service */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Email Service</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Provider</label>
              <select
                value={localConfig.emailService}
                onChange={e => updateField('emailService', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="resend">Resend (Recommended)</option>
                <option value="sendgrid">SendGrid</option>
                <option value="smtp">Custom SMTP</option>
              </select>
            </div>

            {/* API Key */}
            {localConfig.emailService !== 'smtp' && (
              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input
                  type="password"
                  value={localConfig.apiKey}
                  onChange={e => updateField('apiKey', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            )}

            {/* SMTP */}
            {localConfig.emailService === 'smtp' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="SMTP Host"
                  value={localConfig.smtpConfig.host}
                  onChange={e => updateSmtpField('host', e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  placeholder="Port"
                  type="number"
                  value={localConfig.smtpConfig.port}
                  onChange={e => updateSmtpField('port', +e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  placeholder="Username"
                  value={localConfig.smtpConfig.user}
                  onChange={e => updateSmtpField('user', e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  placeholder="Password"
                  type="password"
                  value={localConfig.smtpConfig.password}
                  onChange={e => updateSmtpField('password', e.target.value)}
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
              <span>Saving…</span>
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
              <span>Testing…</span>
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
