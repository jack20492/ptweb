/*
  # Setup Admin User Function

  1. New Functions
    - `setup_admin_user` - Creates admin user bypassing RLS
    - `handle_new_user` - Trigger function for new user creation
  
  2. Security
    - Functions run with SECURITY DEFINER to bypass RLS
    - Proper error handling and validation
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
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
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    'supabase_auth', -- Placeholder since auth is handled by Supabase
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.raw_user_meta_data->>'avatar',
    CURRENT_DATE,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to setup admin user
CREATE OR REPLACE FUNCTION setup_admin_user(
  admin_email TEXT DEFAULT 'admin@phinpt.com',
  admin_password TEXT DEFAULT 'admin123',
  admin_username TEXT DEFAULT 'admin',
  admin_full_name TEXT DEFAULT 'Phi Nguyễn PT',
  admin_phone TEXT DEFAULT '0123456789'
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  auth_user_id UUID;
  existing_user_id UUID;
BEGIN
  -- Check if admin user already exists in public.users
  SELECT id INTO existing_user_id
  FROM public.users
  WHERE email = admin_email OR username = admin_username
  LIMIT 1;

  IF existing_user_id IS NOT NULL THEN
    RAISE NOTICE 'Admin user already exists with ID: %', existing_user_id;
    RETURN TRUE;
  END IF;

  -- Check if auth user exists
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = admin_email
  LIMIT 1;

  IF auth_user_id IS NULL THEN
    -- Create auth user first
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
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object(
        'username', admin_username,
        'full_name', admin_full_name,
        'role', 'admin',
        'phone', admin_phone
      ),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO auth_user_id;
  END IF;

  -- Create or update public.users record
  INSERT INTO public.users (
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
  )
  VALUES (
    auth_user_id,
    admin_username,
    admin_email,
    'supabase_auth',
    admin_full_name,
    admin_phone,
    'admin',
    CURRENT_DATE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = 'admin',
    updated_at = NOW();

  RAISE NOTICE 'Admin user setup completed with ID: %', auth_user_id;
  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error setting up admin user: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Execute the function to create admin user
SELECT setup_admin_user();