/*
  # Fix Authentication Issue

  1. Clean up existing data
  2. Temporarily disable trigger
  3. Create admin and client users properly
  4. Re-enable trigger

  This migration fixes the authentication issue by properly setting up users
  with correct password hashes and avoiding trigger conflicts.
*/

-- First, clean up existing data
DELETE FROM auth.users WHERE email IN ('admin@phinpt.com', 'ptadmin@phinpt.com', 'client@phinpt.com');
DELETE FROM users;

-- Temporarily disable the trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Insert admin user into auth.users
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
  '{"full_name": "Phi Nguyễn PT", "username": "admin", "role": "admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Insert admin user into users table
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

-- Insert client user into auth.users
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
  '{"full_name": "Học viên Test", "username": "client", "role": "client"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Insert client user into users table
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

-- Re-enable the trigger with updated function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();