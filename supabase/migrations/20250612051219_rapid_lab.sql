-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
    COALESCE(new.encrypted_password, 'default_hash'),
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

-- Function to create admin user (simplified approach)
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
  
  -- Hash the password using pgcrypto
  hashed_password := crypt('admin123', gen_salt('bf'));

  -- Insert into auth.users first (this will trigger the handle_new_user function)
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

  -- Update the users table to ensure admin role and correct password hash
  UPDATE public.users 
  SET role = 'admin', password_hash = hashed_password
  WHERE id = admin_user_id;

  RAISE NOTICE 'Admin user created successfully with email: admin@phinpt.com and password: admin123';
END;
$$;

-- Execute the function to create admin user
SELECT create_admin_user();

-- Clean up the function (optional)
DROP FUNCTION create_admin_user();