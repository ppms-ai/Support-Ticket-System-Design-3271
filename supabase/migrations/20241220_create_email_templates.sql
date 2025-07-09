-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates_hub2024 (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE email_templates_hub2024 ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Allow admin access" ON email_templates_hub2024
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates_hub2024
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();

-- Insert default email templates
INSERT INTO email_templates_hub2024 (id, name, subject, html_content, variables)
VALUES
  ('ticket_confirmation', 'Ticket Confirmation', 'Your Support Ticket #{{ticket_number}} Has Been Received', 
  '<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Ticket Confirmation</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(to right, {{primary_color}}, {{primary_color}}); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
      .content { background: #fff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none; }
      .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #718096; }
      .ticket-info { background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; }
      .ticket-number { font-family: monospace; background-color: #f0f9ff; color: #0ea5e9; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
      .ticket-status { background-color: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 4px 0; }
      .ticket-priority-high { background-color: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 4px 0; }
      .ticket-priority-medium { background-color: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 4px 0; }
      .ticket-priority-low { background-color: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 4px 0; }
      .button { display: inline-block; background-color: {{primary_color}}; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; }
      .info-box { background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; }
      .info-heading { font-weight: bold; margin-bottom: 8px; color: {{secondary_color}}; }
      h1 { margin: 0; color: white; font-size: 24px; }
      h2 { color: {{secondary_color}}; font-size: 20px; margin-top: 0; }
      table { border-collapse: collapse; width: 100%; margin: 16px 0; }
      th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; }
      th { background-color: #f8fafc; color: {{secondary_color}}; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Support Ticket Confirmation</h1>
      </div>
      <div class="content">
        <h2>Thank You, {{customer_name}}!</h2>
        <p>We have received your support request and our team will review it promptly. Here are your ticket details:</p>
        
        <div class="ticket-info">
          <p><strong>Ticket Number:</strong> <span class="ticket-number">{{ticket_number}}</span></p>
          <p><strong>Status:</strong> <span class="ticket-status">{{status}}</span></p>
          <p><strong>Priority:</strong> 
            <span class="ticket-priority-{{priority}}">{{priority}}</span>
          </p>
          <p><strong>Subject:</strong> {{subject}}</p>
          <p><strong>Business/Service:</strong> {{business}}</p>
          <p><strong>Date Submitted:</strong> {{created_at}}</p>
        </div>
        
        <h3>Your Request:</h3>
        <p>{{description}}</p>
        
        <div class="info-box">
          <p class="info-heading">What Happens Next?</p>
          <p>Our support team will review your ticket and respond as soon as possible. You will receive email updates when there are changes to your ticket status or when our team adds responses.</p>
        </div>
        
        <p style="text-align: center; margin: 24px 0;">
          <a href="{{status_check_url}}" class="button">Check Ticket Status</a>
        </p>
        
        <p>If you need immediate assistance, please contact us at {{from_email}} or reply directly to this email.</p>
        
        <p>Thank you for your patience,<br>
        {{from_name}}<br>
        {{company_name}}</p>
      </div>
      <div class="footer">
        <p>© {{company_name}} • {{company_address}}</p>
        <p>This is an automated message, please do not reply directly to this email.</p>
      </div>
    </div>
  </body>
  </html>',
  '[
    {"name": "ticket_number", "description": "Ticket reference number"},
    {"name": "customer_name", "description": "Customer full name"},
    {"name": "customer_email", "description": "Customer email address"},
    {"name": "subject", "description": "Ticket subject"},
    {"name": "description", "description": "Ticket description"},
    {"name": "status", "description": "Current ticket status"},
    {"name": "priority", "description": "Ticket priority level"},
    {"name": "business", "description": "Business or service name"},
    {"name": "created_at", "description": "Ticket creation date"},
    {"name": "status_check_url", "description": "URL to check ticket status"},
    {"name": "company_name", "description": "Your company name"},
    {"name": "company_address", "description": "Company address"},
    {"name": "from_name", "description": "Sender name"},
    {"name": "from_email", "description": "Sender email"},
    {"name": "primary_color", "description": "Primary brand color"},
    {"name": "secondary_color", "description": "Secondary brand color"}
  ]'::jsonb),

  ('new_ticket', 'New Support Ticket: {{subject}}', 'New Support Ticket: {{subject}}', 
  '<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Support Ticket</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(to right, {{primary_color}}, {{primary_color}}); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
      .content { background: #fff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none; }
      .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #718096; }
      .ticket-info { background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; }
      .ticket-number { font-family: monospace; background-color: #f0f9ff; color: #0ea5e9; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
      .ticket-status { background-color: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 4px 0; }
      .ticket-priority-high { background-color: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 4px 0; }
      .ticket-priority-medium { background-color: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 4px 0; }
      .ticket-priority-low { background-color: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 4px 0; }
      .button { display: inline-block; background-color: {{secondary_color}}; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; }
      h1 { margin: 0; color: white; font-size: 24px; }
      h2 { color: {{secondary_color}}; font-size: 20px; margin-top: 0; }
      table { border-collapse: collapse; width: 100%; margin: 16px 0; }
      th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; }
      th { background-color: #f8fafc; color: {{secondary_color}}; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Support Ticket</h1>
      </div>
      <div class="content">
        <h2>{{subject}}</h2>
        <p>A new support ticket has been submitted and requires your attention.</p>
        
        <div class="ticket-info">
          <p><strong>Ticket Number:</strong> <span class="ticket-number">{{ticket_number}}</span></p>
          <p><strong>Status:</strong> <span class="ticket-status">{{status}}</span></p>
          <p><strong>Priority:</strong> 
            <span class="ticket-priority-{{priority}}">{{priority}}</span>
          </p>
          <p><strong>Customer:</strong> {{customer_name}} ({{customer_email}})</p>
          <p><strong>Business/Service:</strong> {{business}}</p>
          <p><strong>Date Submitted:</strong> {{created_at}}</p>
        </div>
        
        <h3>Customer Request:</h3>
        <p>{{description}}</p>
        
        <p style="text-align: center; margin: 24px 0;">
          <a href="{{dashboard_url}}" class="button">View in Dashboard</a>
        </p>
      </div>
      <div class="footer">
        <p>© {{company_name}} • {{company_address}}</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  </body>
  </html>',
  '[
    {"name": "ticket_number", "description": "Ticket reference number"},
    {"name": "customer_name", "description": "Customer full name"},
    {"name": "customer_email", "description": "Customer email address"},
    {"name": "subject", "description": "Ticket subject"},
    {"name": "description", "description": "Ticket description"},
    {"name": "status", "description": "Current ticket status"},
    {"name": "priority", "description": "Ticket priority level"},
    {"name": "business", "description": "Business or service name"},
    {"name": "created_at", "description": "Ticket creation date"},
    {"name": "dashboard_url", "description": "URL to admin dashboard"},
    {"name": "company_name", "description": "Your company name"},
    {"name": "company_address", "description": "Company address"},
    {"name": "primary_color", "description": "Primary brand color"},
    {"name": "secondary_color", "description": "Secondary brand color"}
  ]'::jsonb),

  ('ticket_update', 'Update on Your Support Ticket #{{ticket_number}}', 'Update on Your Support Ticket #{{ticket_number}}', 
  '<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Ticket Update</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(to right, {{primary_color}}, {{primary_color}}); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
      .content { background: #fff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none; }
      .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #718096; }
      .ticket-info { background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; }
      .ticket-number { font-family: monospace; background-color: #f0f9ff; color: #0ea5e9; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
      .ticket-status { background-color: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 4px 0; }
      .update-box { background-color: #f0f9ff; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid {{primary_color}}; }
      .button { display: inline-block; background-color: {{primary_color}}; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; }
      h1 { margin: 0; color: white; font-size: 24px; }
      h2 { color: {{secondary_color}}; font-size: 20px; margin-top: 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Support Ticket Update</h1>
      </div>
      <div class="content">
        <h2>Hello, {{customer_name}}!</h2>
        <p>There has been an update to your support ticket:</p>
        
        <div class="ticket-info">
          <p><strong>Ticket Number:</strong> <span class="ticket-number">{{ticket_number}}</span></p>
          <p><strong>Subject:</strong> {{subject}}</p>
          <p><strong>Current Status:</strong> <span class="ticket-status" style="background-color: {{status_color}};">{{status}}</span></p>
          <p><strong>Last Updated:</strong> {{update_time}}</p>
          <p><strong>Assigned To:</strong> {{assignee}}</p>
        </div>
        
        <div class="update-box">
          <h3 style="margin-top: 0;">Update from Support Team:</h3>
          <p>{{update_message}}</p>
        </div>
        
        <p style="text-align: center; margin: 24px 0;">
          <a href="{{status_check_url}}" class="button">Check Full Ticket Details</a>
        </p>
        
        <p>If you have any questions or need to provide additional information, please reply directly to this email or check your ticket status using the link above.</p>
        
        <p>Thank you,<br>
        {{from_name}}<br>
        {{company_name}}</p>
      </div>
      <div class="footer">
        <p>© {{company_name}} • {{company_address}}</p>
        <p>This email was sent regarding your support ticket #{{ticket_number}}.</p>
      </div>
    </div>
  </body>
  </html>',
  '[
    {"name": "ticket_number", "description": "Ticket reference number"},
    {"name": "customer_name", "description": "Customer full name"},
    {"name": "customer_email", "description": "Customer email address"},
    {"name": "subject", "description": "Ticket subject"},
    {"name": "status", "description": "Current ticket status"},
    {"name": "status_color", "description": "Color code for status"},
    {"name": "assignee", "description": "Name of assigned team member"},
    {"name": "update_time", "description": "Time of this update"},
    {"name": "update_message", "description": "Custom update message"},
    {"name": "status_check_url", "description": "URL to check ticket status"},
    {"name": "company_name", "description": "Your company name"},
    {"name": "company_address", "description": "Company address"},
    {"name": "from_name", "description": "Sender name"},
    {"name": "from_email", "description": "Sender email"},
    {"name": "primary_color", "description": "Primary brand color"},
    {"name": "secondary_color", "description": "Secondary brand color"}
  ]'::jsonb),

  ('ticket_resolved', 'Your Support Ticket #{{ticket_number}} Has Been Resolved', 'Your Support Ticket #{{ticket_number}} Has Been Resolved', 
  '<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Ticket Resolved</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(to right, {{primary_color}}, {{primary_color}}); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
      .content { background: #fff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none; }
      .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #718096; }
      .ticket-info { background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; }
      .ticket-number { font-family: monospace; background-color: #f0f9ff; color: #0ea5e9; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
      .resolved-badge { background-color: #dcfce7; color: #16a34a; padding: 6px 12px; border-radius: 4px; display: inline-block; margin: 4px 0; font-weight: bold; }
      .resolution-box { background-color: #f0fdf4; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #16a34a; }
      .button-primary { display: inline-block; background-color: {{primary_color}}; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; }
      .button-secondary { display: inline-block; background-color: {{secondary_color}}; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; }
      .button-container { display: flex; justify-content: center; gap: 16px; margin: 24px 0; }
      h1 { margin: 0; color: white; font-size: 24px; }
      h2 { color: {{secondary_color}}; font-size: 20px; margin-top: 0; }
      .success-icon { text-align: center; font-size: 48px; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Support Ticket Resolved</h1>
      </div>
      <div class="content">
        <div class="success-icon">✓</div>
        <h2>Good News, {{customer_name}}!</h2>
        <p>Your support ticket has been successfully resolved. We're pleased to inform you that your issue has been addressed.</p>
        
        <div class="ticket-info">
          <p><strong>Ticket Number:</strong> <span class="ticket-number">{{ticket_number}}</span></p>
          <p><strong>Subject:</strong> {{subject}}</p>
          <p><strong>Status:</strong> <span class="resolved-badge">Resolved</span></p>
          <p><strong>Resolved By:</strong> {{assignee}}</p>
          <p><strong>Resolution Time:</strong> {{resolution_time}}</p>
        </div>
        
        <div class="resolution-box">
          <h3 style="margin-top: 0; color: #16a34a;">Resolution Details:</h3>
          <p>{{resolution_message}}</p>
        </div>
        
        <div class="button-container">
          <a href="{{status_check_url}}" class="button-primary">View Ticket Details</a>
          <a href="{{feedback_url}}" class="button-secondary">Rate Our Support</a>
        </div>
        
        <p>If you have any further questions or need additional assistance, please don't hesitate to contact us by replying to this email or opening a new support ticket.</p>
        
        <p>Thank you for your patience during this process. We value your business and are committed to providing you with excellent support.</p>
        
        <p>Best regards,<br>
        {{from_name}}<br>
        {{company_name}}</p>
      </div>
      <div class="footer">
        <p>© {{company_name}} • {{company_address}}</p>
        <p>This email was sent regarding your support ticket #{{ticket_number}}.</p>
      </div>
    </div>
  </body>
  </html>',
  '[
    {"name": "ticket_number", "description": "Ticket reference number"},
    {"name": "customer_name", "description": "Customer full name"},
    {"name": "customer_email", "description": "Customer email address"},
    {"name": "subject", "description": "Ticket subject"},
    {"name": "assignee", "description": "Name of team member who resolved the issue"},
    {"name": "resolution_time", "description": "Time when ticket was resolved"},
    {"name": "resolution_message", "description": "Resolution details message"},
    {"name": "status_check_url", "description": "URL to check ticket status"},
    {"name": "feedback_url", "description": "URL to provide feedback"},
    {"name": "company_name", "description": "Your company name"},
    {"name": "company_address", "description": "Company address"},
    {"name": "from_name", "description": "Sender name"},
    {"name": "from_email", "description": "Sender email"},
    {"name": "primary_color", "description": "Primary brand color"},
    {"name": "secondary_color", "description": "Secondary brand color"}
  ]'::jsonb),

  ('test_email', 'Test Email from Support Hub', 'Test Email from Support Hub', 
  '<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Email</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(to right, {{primary_color}}, {{primary_color}}); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
      .content { background: #fff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none; }
      .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #718096; }
      .info-box { background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; }
      .success-badge { background-color: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 4px; display: inline-block; font-weight: bold; }
      h1 { margin: 0; color: white; font-size: 24px; }
      h2 { color: {{secondary_color}}; font-size: 20px; margin-top: 0; }
      table { border-collapse: collapse; width: 100%; }
      th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; }
      th { background-color: #f8fafc; color: {{secondary_color}}; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Test Email</h1>
      </div>
      <div class="content">
        <h2>Email Configuration Test <span class="success-badge">Success!</span></h2>
        <p>This is a test email to confirm that your email configuration is working correctly. If you're seeing this message, your email service is properly configured.</p>
        
        <div class="info-box">
          <h3 style="margin-top: 0;">Configuration Details:</h3>
          <table>
            <tr>
              <th>Email Service</th>
              <td>{{email_service}}</td>
            </tr>
            <tr>
              <th>From Name</th>
              <td>{{from_name}}</td>
            </tr>
            <tr>
              <th>From Email</th>
              <td>{{from_email}}</td>
            </tr>
            <tr>
              <th>Recipients</th>
              <td>{{recipients}}</td>
            </tr>
            <tr>
              <th>Test Time</th>
              <td>{{test_time}}</td>
            </tr>
          </table>
        </div>
        
        <p>You can now use this configuration to send ticket notifications, updates, and other communications to your customers and support team.</p>
        
        <p>Best regards,<br>
        Support Hub Team<br>
        {{company_name}}</p>
      </div>
      <div class="footer">
        <p>© {{company_name}} • {{company_address}}</p>
        <p>This is a test email. No action is required.</p>
      </div>
    </div>
  </body>
  </html>',
  '[
    {"name": "email_service", "description": "Email service provider name"},
    {"name": "from_name", "description": "Sender name"},
    {"name": "from_email", "description": "Sender email"},
    {"name": "recipients", "description": "List of recipient emails"},
    {"name": "test_time", "description": "Time when test was sent"},
    {"name": "company_name", "description": "Your company name"},
    {"name": "company_address", "description": "Company address"},
    {"name": "primary_color", "description": "Primary brand color"},
    {"name": "secondary_color", "description": "Secondary brand color"}
  ]'::jsonb)
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  variables = EXCLUDED.variables,
  updated_at = NOW();