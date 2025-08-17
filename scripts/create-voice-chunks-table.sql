-- Create voice_chunks table for storing audio chunks and transcriptions
CREATE TABLE IF NOT EXISTS voice_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_data TEXT, -- Base64 encoded audio data
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 120, -- 2 minutes
  transcription TEXT,
  status TEXT DEFAULT 'recording' CHECK (status IN ('recording', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voice_chunks_session_id ON voice_chunks(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_chunks_user_id ON voice_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_chunks_timestamp ON voice_chunks(timestamp);

-- Add RLS policies
ALTER TABLE voice_chunks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own voice chunks
CREATE POLICY "Users can view their own voice chunks" ON voice_chunks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice chunks" ON voice_chunks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice chunks" ON voice_chunks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice chunks" ON voice_chunks
  FOR DELETE USING (auth.uid() = user_id);

-- Update voice_recordings table to include transcription field if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'voice_recordings' AND column_name = 'transcription') THEN
    ALTER TABLE voice_recordings ADD COLUMN transcription TEXT;
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for voice_chunks
CREATE TRIGGER update_voice_chunks_updated_at 
    BEFORE UPDATE ON voice_chunks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
