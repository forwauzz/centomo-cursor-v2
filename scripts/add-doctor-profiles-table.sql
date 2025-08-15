-- Add doctor_profiles table to existing database
-- Run this script in your Supabase SQL editor

-- Doctor profiles table - stores doctor-specific information
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id TEXT,
  credentials TEXT,
  specialty TEXT,
  license_number TEXT,
  practice_address TEXT,
  practice_phone TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON doctor_profiles(user_id);

-- Enable RLS
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own doctor profile" ON doctor_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own doctor profile" ON doctor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own doctor profile" ON doctor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for automatic updated_at
CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
