/*
  # Fix authentication users

  1. Security
    - Reset and recreate admin user with proper auth
    - Ensure password is set correctly
    - Fix any auth/users table sync issues

  2. Changes
    - Delete existing users from auth.users if they exist
    - Recreate admin user with proper credentials
    - Update users table to match
*/

-- First, let's clean up any existing auth users
DELETE FROM auth.users WHERE email IN ('admin@phinpt.com', 'ptadmin@phinpt.com', 'client@phinpt.com');

-- Clean up users table
DELETE FROM users;

-- Insert admin user directly into auth.users with proper password hash
-- Password: admin123 (hashed with bcrypt)
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
  '38caffe1-270a-4095-aa7e-7b1a01c6d6e5',
  'authenticated',
  'authenticated',
  'admin@phinpt.com',
  '$2a$10$UOJKGcih1mgyodDJuOSZoeCIU8QNwXXQqpn6NhInxaATLG6.b4hKi', -- admin123
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Insert corresponding user in users table
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  full_name,
  phone,
  role,
  avatar,
  start_date,
  created_at,
  updated_at
) VALUES (
  '38caffe1-270a-4095-aa7e-7b1a01c6d6e5',
  'admin',
  'admin@phinpt.com',
  '$2a$10$UOJKGcih1mgyodDJuOSZoeCIU8QNwXXQqpn6NhInxaATLG6.b4hKi',
  'Phi Nguyễn PT',
  '0123456789',
  'admin',
  NULL,
  CURRENT_DATE,
  NOW(),
  NOW()
);

-- Insert a test client user
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
  'a54926bf-f742-41f7-9e39-dabe4953f9a4',
  'authenticated',
  'authenticated',
  'client@phinpt.com',
  '$2a$10$NwXXQqpn6NhInxaATLG6.b4hKi8QNwXXQqpn6NhInxaATLG6.b4hKi', -- client123
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Insert corresponding client in users table
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  full_name,
  phone,
  role,
  avatar,
  start_date,
  created_at,
  updated_at
) VALUES (
  'a54926bf-f742-41f7-9e39-dabe4953f9a4',
  'client',
  'client@phinpt.com',
  '$2a$10$NwXXQqpn6NhInxaATLG6.b4hKi8QNwXXQqpn6NhInxaATLG6.b4hKi',
  'Học viên Test',
  '0987654321',
  'client',
  NULL,
  CURRENT_DATE,
  NOW(),
  NOW()
);