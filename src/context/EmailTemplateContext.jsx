import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

const EmailTemplateContext = createContext();

export const useEmailTemplates = () => {
  const context = useContext(EmailTemplateContext);
  if (!context) {
    throw new Error('useEmailTemplates must be used within an EmailTemplateProvider');
  }
  return context;
};

export const EmailTemplateProvider = ({ children }) => {
  const [templates, setTemplates] = useState([]);
  const [brandingConfig, setBrandingConfig] = useState({
    company_name: 'Your Company Name',
    company_address: '123 Main Street, City, State 12345',
    company_logo: '',
    primary_color: '#e4a4ab',
    secondary_color: '#474747',
    dashboard_url: window.location.origin + '/#/admin/dashboard'
  });

  useEffect(() => {
    loadTemplates();
    loadBrandingConfig();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates_hub2024')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading templates:', error);
        return;
      }
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadBrandingConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('email_config_hub2024')
        .select('config')
        .eq('id', 'branding')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading branding config:', error);
        return;
      }
      if (data?.config) {
        setBrandingConfig(prev => ({ ...prev, ...data.config }));
      }
    } catch (error) {
      console.error('Error loading branding config:', error);
    }
  };

  const saveTemplate = async (templateId, templateData) => {
    try {
      const { data, error } = await supabase
        .from('email_templates_hub2024')
        .upsert({
          id: templateId,
          ...templateData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving template:', error);
        throw error;
      }
      setTemplates(prev =>
        prev.map(template =>
          template.id === templateId ? data : template
        )
      );
      return data;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  const saveBrandingConfig = async (config) => {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('email_config_hub2024')
        .upsert({
          id: 'branding',
          user_id: userData.user.id,
          config: config,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving branding config:', error);
        throw error;
      }

      setBrandingConfig(config);
      return data;
    } catch (error) {
      console.error('Error saving branding config:', error);
      throw error;
    }
  };

  const getTemplate = (templateId) => {
    return templates.find(template => template.id === templateId);
  };

  const renderTemplate = (templateId, variables = {}) => {
    const template = getTemplate(templateId);
    if (!template) return '';

    const allVariables = { ...brandingConfig, ...variables };

    let rendered = template.html_content;
    let subject = template.subject;
    Object.keys(allVariables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, allVariables[key] || '');
      subject = subject.replace(regex, allVariables[key] || '');
    });

    return { html: rendered, subject };
  };

  const previewTemplate = (templateId, sampleData = {}) => {
    const sampleVariables = {
      ticket_number: 'SUP-123456',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      business: 'Acme Corp',
      priority: 'High',
      priority_color: '#dc2626',
      status: 'Open',
      subject: 'Login Issue with Dashboard',
      description: 'I am unable to log into my dashboard. When I enter my credentials, I get an error message saying "Invalid username or password" but I am sure my credentials are correct.',
      email_service: 'Resend',
      from_name: 'Support Team',
      from_email: 'support@company.com',
      recipients: 'admin@company.com, support@company.com',
      test_time: new Date().toLocaleString(),
      ...sampleData
    };

    return renderTemplate(templateId, sampleVariables);
  };

  return (
    <EmailTemplateContext.Provider
      value={{
        templates,
        brandingConfig,
        loadTemplates,
        saveTemplate,
        saveBrandingConfig,
        getTemplate,
        renderTemplate,
        previewTemplate
      }}
    >
      {children}
    </EmailTemplateContext.Provider>
  );
};
