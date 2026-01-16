-- Create profiles table to extend auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'laundry_guy')),
  building TEXT,
  flat_no TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availability table
CREATE TABLE availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Laundry guys can view user profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'laundry_guy'
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Availability policies
CREATE POLICY "Users can view their own availability"
  ON availability FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Laundry guys can view all availability"
  ON availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'laundry_guy'
    )
  );

CREATE POLICY "Users can insert their own availability"
  ON availability FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own availability"
  ON availability FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get today's available users with their locations
CREATE OR REPLACE FUNCTION get_todays_collections()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  building TEXT,
  flat_no TEXT,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.building,
    p.flat_no,
    COALESCE(a.is_available, FALSE) as is_available
  FROM profiles p
  LEFT JOIN availability a ON p.id = a.user_id AND a.date = CURRENT_DATE
  WHERE p.role = 'user' AND p.building IS NOT NULL AND p.flat_no IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
