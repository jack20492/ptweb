-- Fix authentication sync issues
-- This migration ensures proper sync between auth.users and public.users

-- First, let's clean up any inconsistencies
DELETE FROM auth.users WHERE email NOT IN ('admin@phinpt.com', 'ptadmin@phinpt.com', 'client@phinpt.com');
DELETE FROM users WHERE email NOT IN ('admin@phinpt.com', 'ptadmin@phinpt.com', 'client@phinpt.com');

-- Ensure we have the admin user in auth.users
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
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password;

-- Ensure we have the ptadmin user in auth.users
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
  '052be677-6cab-4e81-851a-01f0bef1dc15',
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
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password;

-- Ensure we have the client user in auth.users
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
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password;

-- Update the users table to match the auth.users IDs
UPDATE users SET id = '38caffe1-270a-4095-aa7e-7b1a01c6d6e5' WHERE email = 'admin@phinpt.com';
UPDATE users SET id = '052be677-6cab-4e81-851a-01f0bef1dc15' WHERE email = 'ptadmin@phinpt.com';
UPDATE users SET id = 'a54926bf-f742-41f7-9e39-dabe4953f9a4' WHERE email = 'client@phinpt.com';

-- Create a function to sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically sync new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();