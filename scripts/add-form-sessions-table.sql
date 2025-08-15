-- Add form_sessions table to existing database
-- Run this script in your Supabase SQL editor

-- Form sessions table - stores form session data
CREATE TABLE IF NOT EXISTS form_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_data JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_sessions_user_id ON form_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_form_sessions_expires_at ON form_sessions(expires_at);

-- Enable RLS
ALTER TABLE form_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own form sessions" ON form_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own form sessions" ON form_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own form sessions" ON form_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for automatic updated_at
CREATE TRIGGER update_form_sessions_updated_at BEFORE UPDATE ON form_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
