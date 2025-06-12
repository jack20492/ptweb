-- Clean up any existing problematic data
DELETE FROM auth.users WHERE email = 'admin@phinpt.com';
DELETE FROM users WHERE email = 'admin@phinpt.com';

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if user doesn't already exist
  INSERT INTO public.users (
    id, 
    username, 
    email, 
    full_name, 
    phone,
    role, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update the setup_admin_user function
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
    username = 'admin',
    email = 'admin@phinpt.com',
    full_name = 'Phi Nguyễn PT',
    phone = '0123456789',
    role = 'admin',
    updated_at = NOW();
END;
$$;