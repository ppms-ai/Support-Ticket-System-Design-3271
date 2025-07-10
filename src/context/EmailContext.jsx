import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

const EmailContext = createContext();

export const useEmail = () => {
  const ctx = useContext(EmailContext);
  if (!ctx) throw new Error('useEmail must be used within an EmailProvider');
  return ctx;
};

export const EmailProvider = ({ children }) => {
  const [emailConfig, setEmailConfig] = useState({
    notificationEmails: [],
    fromEmail: '',
    fromName: '',
    emailService: 'resend', // resend, sendgrid or smtp
    apiKey: '',
    smtpConfig: { host: '', port: 587, secure: false, user: '', password: '' },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // load on mount
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('email_config_hub2024')
          .select('*')
          .eq('id', 'email_settings')
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setEmailConfig({
            notificationEmails: data.notification_recipients || [],
            fromEmail: data.from_email || '',
            fromName: data.from_name || '',
            emailService: data.email_service || 'resend',
            apiKey: data.api_key || '',
            smtpConfig: {
              host: data.smtp_host || '',
              port: data.smtp_port || 587,
              secure: data.smtp_secure || false,
              user: data.smtp_user || '',
              password: data.smtp_password || '',
            },
          });
        }
      } catch (err) {
        console.error('Error loading email config:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveEmailConfig = async updatedConfig => {
    setIsSaving(true);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error('Not authenticated');

      const payload = {
        id: 'email_settings',
        user_id: user.id,
        user_email: user.email,
        notification_recipients: updatedConfig.notificationEmails,
        from_email: updatedConfig.fromEmail,
        from_name: updatedConfig.fromName,
        email_service: updatedConfig.emailService,
        api_key: updatedConfig.apiKey,
        smtp_host: updatedConfig.smtpConfig.host,
        smtp_port: updatedConfig.smtpConfig.port,
        smtp_secure: updatedConfig.smtpConfig.secure,
        smtp_user: updatedConfig.smtpConfig.user,
        smtp_password: updatedConfig.smtpConfig.password,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('email_config_hub2024')
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;

      setEmailConfig({
        notificationEmails: data.notification_recipients || [],
        fromEmail: data.from_email || '',
        fromName: data.from_name || '',
        emailService: data.email_service || 'resend',
        apiKey: data.api_key || '',
        smtpConfig: {
          host: data.smtp_host || '',
          port: data.smtp_port || 587,
          secure: data.smtp_secure || false,
          user: data.smtp_user || '',
          password: data.smtp_password || '',
        },
      });
    } catch (err) {
      console.error('Error saving email config:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const addNotificationEmail = async email => {
    const updated = [...emailConfig.notificationEmails, email];
    await saveEmailConfig({ ...emailConfig, notificationEmails: updated });
  };

  const removeNotificationEmail = async email => {
    const updated = emailConfig.notificationEmails.filter(e => e !== email);
    await saveEmailConfig({ ...emailConfig, notificationEmails: updated });
  };

  const updateEmailService = service => {
    setEmailConfig(cfg => ({ ...cfg, emailService: service }));
  };

  const testEmailConfiguration = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          to: emailConfig.notificationEmails[0] || '',
          from: emailConfig.fromEmail,
          subject: 'Test Notification',
          message: 'This is a test.',
        }
      });
      setTestResult(error ? { success: false, message: error.message } : { success: true, message: 'Test sent!' });
    } catch (err) {
      console.error('Error testing email config:', err);
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <EmailContext.Provider
      value={{
        emailConfig,
        isLoading,
        isSaving,
        isTesting,
        testResult,
        saveEmailConfig,
        addNotificationEmail,
        removeNotificationEmail,
        updateEmailService,
        testEmailConfiguration,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};
