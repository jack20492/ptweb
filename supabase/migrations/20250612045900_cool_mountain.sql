/*
  # Fix Authentication System

  1. Clean up existing data
  2. Create proper admin user setup
  3. Fix the handle_new_user function
  4. Set up proper RLS policies
*/

-- Clean up existing users table data
DELETE FROM users;

-- Update the handle_new_user function to handle username properly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    username, 
    email, 
    full_name, 
    role, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create a function to setup admin user (to be called from application)
CREATE OR REPLACE FUNCTION setup_admin_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update admin user in users table
  INSERT INTO public.users (
    id,
    username,
    email,
    full_name,
    phone,
    role,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    'admin',
    'admin@phinpt.com',
    'Phi Nguyễn PT',
    '0123456789',
    'admin',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    updated_at = NOW();
END;
$$;