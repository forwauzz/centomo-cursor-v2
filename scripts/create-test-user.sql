-- Create test user manually for testing
-- Run this in Supabase SQL Editor

INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    'test@centomomd.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Also create a user in our custom users table
-- Note: You'll need to replace the auth_user_id with the actual UUID from auth.users
-- You can find this by running: SELECT id, email FROM auth.users WHERE email = 'test@centomomd.com';

-- Example (replace the UUID with the actual one):
-- INSERT INTO users (
--     id,
--     email,
--     oauth_provider,
--     oauth_sub,
--     role,
--     status,
--     full_name,
--     created_at,
--     updated_at
-- ) VALUES (
--     'REPLACE_WITH_ACTUAL_AUTH_USER_ID',
--     'test@centomomd.com',
--     'email',
--     'REPLACE_WITH_ACTUAL_AUTH_USER_ID',
--     'doctor',
--     'active',
--     'Test User',
--     NOW(),
--     NOW()
-- );
