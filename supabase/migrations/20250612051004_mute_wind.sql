/*
  # Create Admin Account

  This migration creates the default admin account for the PT management system.
  
  1. Creates admin user in auth.users
  2. Creates corresponding profile in public.users
  3. Sets up proper credentials for login
  
  Default admin credentials:
  - Username: admin
  - Email: admin@phinpt.com  
  - Password: admin123
*/

-- First, let's make sure we have the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, username, email, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
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
BEGIN
  -- Check if admin already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE username = 'admin' OR email = 'admin@phinpt.com') THEN
    RAISE NOTICE 'Admin user already exists';
    RETURN;
  END IF;

  -- Generate a UUID for the admin user
  admin_user_id := gen_random_uuid();

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
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "admin", "full_name": "Admin User", "role": "admin"}',
    false,
    'authenticated',
    'authenticated'
  );

  -- Insert into public.users (this will be handled by the trigger, but let's be explicit)
  INSERT INTO public.users (
    id,
    username,
    email,
    full_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin',
    'admin@phinpt.com',
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