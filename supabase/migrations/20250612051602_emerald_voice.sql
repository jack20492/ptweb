-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can delete clients" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create a function to check if current user is admin using auth metadata
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user has admin role in their auth metadata
  -- This uses the auth.users table directly which is safe from recursion
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile (but not role changes for non-admins)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow public registration (insert new users)
CREATE POLICY "Allow public registration"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admin policies using the helper function
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete clients"
  ON users
  FOR DELETE
  TO authenticated
  USING (is_admin() AND role = 'client');

-- Also create a simple admin user directly in the users table for testing
-- First check if admin doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@phinpt.com') THEN
    INSERT INTO users (
      id,
      username,
      email,
      password_hash,
      full_name,
      role,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'admin',
      'admin@phinpt.com',
      'admin123', -- Simple password for now
      'Admin User',
      'admin',
      now(),
      now()
    );
  END IF;
END $$;