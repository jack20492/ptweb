/*
  # Fix Admin Account Creation

  1. Updates
    - Fix handle_new_user function to include password_hash
    - Create admin user properly with all required fields
    - Handle the NOT NULL constraint on password_hash column

  2. Security
    - Proper password hashing
    - Admin user creation with proper authentication setup
*/

-- First, let's make sure we have the handle_new_user function with password_hash
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, username, email, password_hash, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.encrypted_password, crypt('defaultpassword', gen_salt('bf'))),
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'client')
  );
  RETURN new;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
  hashed_password text;
BEGIN
  -- Check if admin already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE username = 'admin' OR email = 'admin@phinpt.com') THEN
    RAISE NOTICE 'Admin user already exists';
    RETURN;
  END IF;

  -- Generate a UUID for the admin user
  admin_user_id := gen_random_uuid();
  
  -- Hash the password
  hashed_password := crypt('admin123', gen_salt('bf'));

  -- Temporarily disable the trigger to avoid conflicts
  ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

  -- Insert into auth.users (this is the main auth table)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    admin_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@phinpt.com',
    hashed_password,
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "admin", "full_name": "Admin User", "role": "admin"}',
    false,
    'authenticated',
    'authenticated'
  );

  -- Re-enable the trigger
  ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

  -- Insert into public.users manually since we disabled the trigger
  INSERT INTO public.users (
    id,
    username,
    email,
    password_hash,
    full_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin',
    'admin@phinpt.com',
    hashed_password,
    'Admin User',
    'admin',
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Admin user created successfully with email: admin@phinpt.com and password: admin123';
END;
$$;

-- Execute the function to create admin user
SELECT create_admin_user();

-- Clean up the function (optional)
DROP FUNCTION create_admin_user();