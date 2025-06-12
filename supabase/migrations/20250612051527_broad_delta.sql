/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current admin policies query the users table to check if the current user is an admin
    - This creates infinite recursion when the policy tries to access the same table it's protecting

  2. Solution
    - Drop existing problematic policies
    - Create new policies that avoid self-referential queries
    - Use a simpler approach for admin access that doesn't create recursion

  3. New Policies
    - Users can read their own data (using auth.uid())
    - Admins can manage users (using a custom function that doesn't create recursion)
    - Public registration is allowed for new users
*/

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can delete clients" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create a function to check if current user is admin without recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user has admin role in their JWT claims
  -- This avoids querying the users table directly
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from changing their own role
    (OLD.role = NEW.role OR is_admin())
  );

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