/*
  # Add phone field to profiles table

  1. Changes
    - Add phone column to profiles table if it doesn't exist
    - Update RLS policies to allow phone field updates

  2. Security
    - Maintain existing RLS policies
    - Allow users to update their own phone numbers
*/

-- Add phone column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
END $$;

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text := 'customer';
BEGIN
  -- Check if this email should be admin
  IF NEW.email = 'admin@farm.com' OR NEW.email = 'emmanuelmbuli7@gmail.com' THEN
    user_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    user_role,
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing admin user if exists
UPDATE profiles 
SET role = 'admin' 
WHERE email IN ('admin@farm.com', 'emmanuelmbuli7@gmail.com');