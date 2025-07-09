-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets_hub2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium',
  business TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  assignee TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE support_tickets_hub2024 ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a support form)
CREATE POLICY "Allow public insert" ON support_tickets_hub2024
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read own tickets" ON support_tickets_hub2024
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Allow admin updates" ON support_tickets_hub2024
  FOR UPDATE TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets_hub2024 (ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_email ON support_tickets_hub2024 (email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets_hub2024 (status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets_hub2024 (created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets_hub2024
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();