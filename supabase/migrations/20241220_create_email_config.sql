-- Create email configuration table
CREATE TABLE IF NOT EXISTS email_config_hub2024 (
  id TEXT PRIMARY KEY DEFAULT 'default',
  config JSONB NOT NULL DEFAULT '{
    "notificationEmails": [],
    "fromEmail": "support@yourdomain.com",
    "fromName": "Support Team",
    "emailService": "resend",
    "apiKey": "",
    "smtpConfig": {
      "host": "",
      "port": 587,
      "secure": false,
      "user": "",
      "password": ""
    }
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE email_config_hub2024 ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Allow admin access" ON email_config_hub2024
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_email_config_updated_at
  BEFORE UPDATE ON email_config_hub2024
  FOR EACH ROW
  EXECUTE FUNCTION update_email_config_updated_at();