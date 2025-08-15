-- Create missing database tables for Centomo V2 (FIXED VERSION)
-- Run this script in your Supabase SQL editor

-- 1. Forms table - stores actual form data
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  form_type TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in-progress', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  template_id UUID REFERENCES form_templates(id)
);

-- 2. Form sections table - stores section-specific data
CREATE TABLE IF NOT EXISTS form_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  section_data JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Exports table - tracks export history
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('PDF', 'Word', 'XML', 'JSON')),
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  file_url TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- 4. Voice sessions table - stores voice recording data
CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
  session_data JSONB DEFAULT '{}',
  audio_url TEXT,
  transcription TEXT,
  duration INTEGER DEFAULT 0,
  quality TEXT DEFAULT 'good' CHECK (quality IN ('excellent', 'good', 'poor')),
  status TEXT DEFAULT 'recording' CHECK (status IN ('recording', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Doctor profiles table - stores doctor-specific information
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

-- 6. Form sessions table - stores form session data
CREATE TABLE IF NOT EXISTS form_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_data JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at);

CREATE INDEX IF NOT EXISTS idx_form_sections_form_id ON form_sections(form_id);
CREATE INDEX IF NOT EXISTS idx_form_sections_section_name ON form_sections(section_name);

CREATE INDEX IF NOT EXISTS idx_exports_user_id ON exports(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_form_id ON exports(form_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON exports(status);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_user_id ON voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_form_id ON voice_sessions(form_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON voice_sessions(status);

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON doctor_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_form_sessions_user_id ON form_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_form_sessions_expires_at ON form_sessions(expires_at);

-- Create RLS policies for security
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_sessions ENABLE ROW LEVEL SECURITY;

-- Forms policies
CREATE POLICY "Users can view their own forms" ON forms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own forms" ON forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms" ON forms
  FOR UPDATE USING (auth.uid() = user_id);

-- Form sections policies
CREATE POLICY "Users can view sections of their forms" ON form_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_sections.form_id 
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sections for their forms" ON form_sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_sections.form_id 
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sections of their forms" ON form_sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_sections.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- Exports policies
CREATE POLICY "Users can view their own exports" ON exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exports" ON exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exports" ON exports
  FOR UPDATE USING (auth.uid() = user_id);

-- Voice sessions policies
CREATE POLICY "Users can view their own voice sessions" ON voice_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice sessions" ON voice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice sessions" ON voice_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Doctor profiles policies
CREATE POLICY "Users can view their own doctor profile" ON doctor_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own doctor profile" ON doctor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own doctor profile" ON doctor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Form sessions policies
CREATE POLICY "Users can view their own form sessions" ON form_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own form sessions" ON form_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own form sessions" ON form_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_sections_updated_at BEFORE UPDATE ON form_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_sessions_updated_at BEFORE UPDATE ON voice_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_sessions_updated_at BEFORE UPDATE ON form_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- NOTE: Sample data insertion removed to avoid foreign key constraint errors
-- You can manually insert test data after creating your first user account
