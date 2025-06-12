/*
  # Fix Authentication Sync Issues

  1. Clean up inconsistent data safely
  2. Ensure proper sync between auth.users and public.users
  3. Set up triggers for future sync
*/

-- First, let's safely handle the existing data
-- We'll use a more careful approach to avoid constraint violations

-- Step 1: Create temporary mapping for existing users
DO $$
DECLARE
    admin_auth_id uuid := '38caffe1-270a-4095-aa7e-7b1a01c6d6e5';
    ptadmin_auth_id uuid := '052be677-6cab-4e81-851a-01f0bef1dc15';
    client_auth_id uuid := 'a54926bf-f742-41f7-9e39-dabe4953f9a4';
BEGIN
    -- Step 2: Ensure auth.users has the correct users with proper passwords
    -- Delete any existing auth users that might conflict
    DELETE FROM auth.users WHERE email IN ('admin@phinpt.com', 'ptadmin@phinpt.com', 'client@phinpt.com');
    
    -- Insert admin user into auth.users
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
        admin_auth_id,
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
    );

    -- Insert ptadmin user into auth.users
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
        ptadmin_auth_id,
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
    );

    -- Insert client user into auth.users
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
        client_auth_id,
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
    );

    -- Step 3: Now safely update the users table
    -- First, temporarily disable the unique constraint by updating emails
    UPDATE users SET email = email || '_temp' WHERE email IN ('admin@phinpt.com', 'ptadmin@phinpt.com', 'client@phinpt.com');
    
    -- Update IDs and restore emails
    UPDATE users SET 
        id = admin_auth_id,
        email = 'admin@phinpt.com',
        username = 'admin',
        role = 'admin'
    WHERE email = 'admin@phinpt.com_temp';
    
    UPDATE users SET 
        id = ptadmin_auth_id,
        email = 'ptadmin@phinpt.com',
        username = 'ptadmin',
        role = 'admin'
    WHERE email = 'ptadmin@phinpt.com_temp';
    
    UPDATE users SET 
        id = client_auth_id,
        email = 'client@phinpt.com',
        username = 'client',
        role = 'client'
    WHERE email = 'client@phinpt.com_temp';

    -- Clean up any remaining temp emails or orphaned records
    DELETE FROM users WHERE email LIKE '%_temp' OR email NOT IN ('admin@phinpt.com', 'ptadmin@phinpt.com', 'client@phinpt.com');
END $$;

-- Step 4: Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (
        id,
        username,
        email,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger for automatic sync
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Update RLS policies to work with auth.uid()
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all users" ON users;
CREATE POLICY "Admins can read all users"
    ON users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update users" ON users;
CREATE POLICY "Admins can update users"
    ON users
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can insert users" ON users;
CREATE POLICY "Admins can insert users"
    ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete clients" ON users;
CREATE POLICY "Admins can delete clients"
    ON users
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        ) AND role = 'client'
    );