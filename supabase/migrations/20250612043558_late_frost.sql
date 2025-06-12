/*
  # Create New Admin Account

  1. New Admin User
    - Creates a new admin user with different credentials
    - Username: `ptadmin`
    - Email: `ptadmin@phinpt.com`
    - Password: `ptadmin123`
    - Role: admin

  2. Security
    - Proper password hashing with bcrypt
    - Creates both auth.users and users table entries
    - Ensures proper authentication flow
*/

-- First, delete any existing ptadmin user
DELETE FROM auth.users WHERE email = 'ptadmin@phinpt.com';
DELETE FROM users WHERE email = 'ptadmin@phinpt.com' OR username = 'ptadmin';

-- Create the new admin user in auth.users table
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
  'ptadmin@phinpt.com',
  crypt('ptadmin123', gen_salt('bf')),
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

-- Get the user ID we just created and insert into users table
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'ptadmin@phinpt.com';
  
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
    'ptadmin',
    'ptadmin@phinpt.com',
    crypt('ptadmin123', gen_salt('bf')),
    'PT Admin',
    '0987654321',
    'admin',
    CURRENT_DATE,
    NOW(),
    NOW()
  );
END $$;

-- Also create a client user for testing
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
  'client@phinpt.com',
  crypt('client123', gen_salt('bf')),
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

-- Insert client into users table
DO $$
DECLARE
  client_user_id uuid;
BEGIN
  SELECT id INTO client_user_id FROM auth.users WHERE email = 'client@phinpt.com';
  
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
    client_user_id,
    'client',
    'client@phinpt.com',
    crypt('client123', gen_salt('bf')),
    'Học viên Test',
    '0123456789',
    'client',
    CURRENT_DATE,
    NOW(),
    NOW()
  );
END $$;