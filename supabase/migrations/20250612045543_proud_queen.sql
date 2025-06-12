/*
  # Create Default Admin User

  1. New Functions
    - `create_admin_user()` - Function to create admin user in auth and users table
  
  2. Admin User Setup
    - Creates admin user with email: admin@phinpt.com
    - Sets password to: admin123
    - Assigns admin role
    - Links auth user to users table

  3. Security
    - Ensures admin user has proper permissions
    - Sets up initial admin account for system access
*/

-- Function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists in auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@phinpt.com';
  
  -- If admin user doesn't exist, create it
  IF admin_user_id IS NULL THEN
    -- Insert into auth.users (this is the Supabase auth table)
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
    ) RETURNING id INTO admin_user_id;
  END IF;

  -- Check if admin user exists in public.users table
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@phinpt.com') THEN
    -- Insert into public.users table
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
      crypt('admin123', gen_salt('bf')),
      'System Administrator',
      'admin',
      NOW(),
      NOW()
    );
  END IF;
END;
$$;

-- Execute the function to create admin user
SELECT create_admin_user();

-- Drop the function after use
DROP FUNCTION create_admin_user();