/*
  # Create Admin User

  1. Security
    - Create admin user with proper authentication
    - Set up proper password hashing
    - Ensure admin role is assigned correctly

  2. Changes
    - Delete existing admin user if exists
    - Create new admin user with correct credentials
    - Set up auth.users entry for authentication
*/

-- First, delete any existing admin user
DELETE FROM auth.users WHERE email = 'admin@phinpt.com';
DELETE FROM users WHERE email = 'admin@phinpt.com' OR username = 'admin';

-- Create the admin user in auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@phinpt.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Get the user ID we just created
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@phinpt.com';
  
  -- Insert into users table
  INSERT INTO users (
    id,
    username,
    email,
    password_hash,
    full_name,
    phone,
    role,
    start_date,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin',
    'admin@phinpt.com',
    crypt('admin123', gen_salt('bf')),
    'Phi Nguyễn PT',
    '0123456789',
    'admin',
    CURRENT_DATE,
    NOW(),
    NOW()
  );
END $$;