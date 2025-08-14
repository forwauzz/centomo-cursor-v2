-- CentomoMD V2: Fix Authentication Policies and UUID Mismatch
-- Run this in Supabase SQL Editor

-- First, let's check what's in auth.users vs our users table
SELECT 'auth.users' as source, id, email FROM auth.users
UNION ALL
SELECT 'custom.users' as source, id, email FROM users;

-- The issue: auth.uid() doesn't match users.id because we're generating UUIDs differently
-- Solution: Always use auth.uid() for user IDs when creating users

-- Drop the existing policies that aren't working
DROP POLICY IF EXISTS "Admin full access to users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies that work with Supabase Auth
CREATE POLICY "Users can access their own data" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Service role can access all users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Also add a policy to allow user creation during signup
CREATE POLICY "Enable user creation during signup" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;
