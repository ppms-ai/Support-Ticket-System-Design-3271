import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

const EmailContext = createContext();

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};

export const EmailProvider = ({ children }) => {
  const [emailConfig, setEmailConfig] = useState({
    notificationEmails: [],
    fromEmail: 'support@yourdomain.com',
    fromName: 'Support Team',
    emailService: 'resend', // 'resend', 'sendgrid', 'smtp'
    apiKey: '',
    smtpConfig: {
      host: '',
      port: 587,
      secure: false,
      user: '',
      password: ''
    }
  });

  // Load email configuration from Supabase
  useEffect(() => {
    loadEmailConfig();
  }, []);

  const loadEmailConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('email_config_hub2024')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading email config:', error);
        return;
      }

      if (data) {
        setEmailConfig(data.config);
      }
    } catch (error) {
      console.error('Error loading email config:', error);
    }
  };

  const saveEmailConfig = async (config) => {
    try {
      const { data, error } = await supabase
        .from('email_config_hub2024')
        .upsert({
          id: 'default',
          config: config,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving email config:', error);
        throw error;
      }

      setEmailConfig(config);
      return data;
    } catch (error) {
      console.error('Error saving email config:', error);
      throw error;
    }
  };

  const addNotificationEmail = async (email) => {
    const updatedConfig = {
      ...emailConfig,
      notificationEmails: [...emailConfig.notificationEmails, email]
    };
    await saveEmailConfig(updatedConfig);
  };

  const removeNotificationEmail = async (emailToRemove) => {
    const updatedConfig = {
      ...emailConfig,
      notificationEmails: emailConfig.notificationEmails.filter(email => email !== emailToRemove)
    };
    await saveEmailConfig(updatedConfig);
  };

  const updateEmailService = async (serviceConfig) => {
    const updatedConfig = {
      ...emailConfig,
      ...serviceConfig
    };
    await saveEmailConfig(updatedConfig);
  };

  const sendNotificationEmail = async (ticket) => {
    try {
      // Call Supabase Edge Function for email notification
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'new_ticket',
          ticket: ticket,
          emailConfig: emailConfig
        }
      });

      if (error) {
        console.error('Error sending email notification:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  };

  const testEmailConfiguration = async () => {
    try {
      const testTicket = {
        ticket_number: 'TEST-123456',
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Email Configuration',
        description: 'This is a test email to verify your email configuration.',
        priority: 'Medium',
        business: 'Test Business',
        status: 'Open',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'test_email',
          ticket: testTicket,
          emailConfig: emailConfig
        }
      });

      if (error) {
        console.error('Error testing email configuration:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error testing email configuration:', error);
      throw error;
    }
  };

  return (
    <EmailContext.Provider
      value={{
        emailConfig,
        saveEmailConfig,
        addNotificationEmail,
        removeNotificationEmail,
        updateEmailService,
        sendNotificationEmail,
        testEmailConfiguration,
        loadEmailConfig
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};