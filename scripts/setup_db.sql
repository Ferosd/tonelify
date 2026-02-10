-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table is handled by Clerk/Supabase Auth sync, but let's create a public profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, -- Matches Clerk User ID
  email TEXT,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'free',
  matches_remaining INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. User Equipment Table
CREATE TABLE IF NOT EXISTS public.user_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "My Strat"
  guitar_model TEXT,
  amp_model TEXT,
  pickup_type TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Songs Table
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT,
  year INTEGER,
  search_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Song Gear Table (Original Recording Gear)
CREATE TABLE IF NOT EXISTS public.song_gear (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  guitar_model TEXT,
  amp_model TEXT,
  pickup_type TEXT,
  effects TEXT[], -- Array of strings
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Tone Matches Table (History)
CREATE TABLE IF NOT EXISTS public.tone_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id),
  user_equipment_id UUID REFERENCES public.user_equipment(id),
  settings JSONB, -- The AI result
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- SEED DATA ---------------------------------------------------------

-- Insert Songs
INSERT INTO public.songs (title, artist, genre, year) VALUES
('Little Wing', 'Jimi Hendrix', 'Rock', 1967),
('Gravity', 'John Mayer', 'Blues Rock', 2006),
('Slow Dancing in a Burning Room', 'John Mayer', 'Blues', 2006),
('Sweet Child O Mine', 'Guns N Roses', 'Hard Rock', 1987),
('Comfortably Numb', 'Pink Floyd', 'Progressive Rock', 1979),
('Pride and Joy', 'Stevie Ray Vaughan', 'Blues', 1983),
('Back in Black', 'AC/DC', 'Hard Rock', 1980),
('Sultans of Swing', 'Dire Straits', 'Rock', 1978);

-- Insert Gear for Little Wing (Hendrix)
INSERT INTO public.song_gear (song_id, guitar_model, amp_model, pickup_type, effects)
SELECT id, 'Fender Stratocaster', 'Marshall Super Lead 100', 'Single Coil', ARRAY['Fuzz Face', 'Uni-Vibe', 'Vox Wah']
FROM public.songs WHERE title = 'Little Wing';

-- Insert Gear for Gravity (Mayer)
INSERT INTO public.song_gear (song_id, guitar_model, amp_model, pickup_type, effects)
SELECT id, 'Fender Stratocaster', 'Two-Rock Custom Reverb', 'Single Coil', ARRAY['Klon Centaur', 'Tube Screamer TS10']
FROM public.songs WHERE title = 'Gravity';

-- Insert Gear for Sweet Child O Mine (Slash)
INSERT INTO public.song_gear (song_id, guitar_model, amp_model, pickup_type, effects)
SELECT id, 'Gibson Les Paul Standard', 'Marshall JCM800', 'Humbucker', ARRAY['Boss DD-3 Delay', 'Cry Baby Wah']
FROM public.songs WHERE title = 'Sweet Child O Mine';

-- Insert Gear for Comfortably Numb (Gilmour)
INSERT INTO public.song_gear (song_id, guitar_model, amp_model, pickup_type, effects)
SELECT id, 'Fender Stratocaster (Black Strat)', 'Hiwatt DR103', 'Single Coil', ARRAY['Big Muff Ram Head', 'Electric Mistress Flanger', 'Delay']
FROM public.songs WHERE title = 'Comfortably Numb';

-- Insert Gear for Pride and Joy (SRV)
INSERT INTO public.song_gear (song_id, guitar_model, amp_model, pickup_type, effects)
SELECT id, 'Fender Stratocaster (Number One)', 'Fender Vibroverb', 'Single Coil', ARRAY['Ibanez Tube Screamer TS808']
FROM public.songs WHERE title = 'Pride and Joy';

-- 6. Gear Requests Table (Feature Requests from Users)
CREATE TABLE IF NOT EXISTS public.gear_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  equipment_type TEXT NOT NULL, -- 'guitar', 'amp', 'pedal', 'other'
  equipment_name TEXT,
  additional_info TEXT,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'added'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
