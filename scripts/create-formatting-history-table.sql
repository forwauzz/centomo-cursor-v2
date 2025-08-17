-- Create formatting_history table for storing AI formatting history
CREATE TABLE IF NOT EXISTS formatting_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL, -- 'main_narrative', 'radiology', 'transcript', 'compile'
  original_text TEXT NOT NULL,
  formatted_text TEXT NOT NULL,
  format_type TEXT NOT NULL, -- 'main_narrative', 'radiology', 'transcript', 'compile'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_formatting_history_user_id ON formatting_history(user_id);
CREATE INDEX IF NOT EXISTS idx_formatting_history_section ON formatting_history(section);
CREATE INDEX IF NOT EXISTS idx_formatting_history_created_at ON formatting_history(created_at);

-- Add RLS policies
ALTER TABLE formatting_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own formatting history
CREATE POLICY "Users can view their own formatting history" ON formatting_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own formatting history" ON formatting_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own formatting history" ON formatting_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own formatting history" ON formatting_history
  FOR DELETE USING (auth.uid() = user_id);
