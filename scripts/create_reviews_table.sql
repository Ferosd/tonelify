-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT, -- Can be null for anonymous or fake reviews, or link to profiles.id
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read reviews
CREATE POLICY "Public reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

-- Policy: Only authenticated users can insert reviews
CREATE POLICY "Authenticated users can insert reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Seed Fake Reviews (5-6 as requested)
INSERT INTO reviews (name, rating, comment, created_at) VALUES
('James Hetfield (Fan)', 5, 'The people behind this app are truly amazing! They added my gear in under a week. I found this site from his TikTok and it is wonderful. Sounding like every song I want in under a minute without having to do any work is so amazing <3333', NOW() - INTERVAL '2 days'),
('Anonymous', 4, 'This is so good app but bad news is it doesn,t have same guitar and same amp i use il write names and pls add it. guitar amplifier: NUX Mighty 20MKII Guitar: JET JL500 GD HH', NOW() - INTERVAL '5 days'),
('Sarah J.', 5, 'Finally found the secret to that Mayer tone! The AI suggested settings for my Blues Junior were spot on. Highly recommend.', NOW() - INTERVAL '1 week'),
('MetalHead88', 5, 'Incredible accuracy for high gain tones. Matched a complex Meshuggah tone with just my Boss Katana. 10/10.', NOW() - INTERVAL '3 days'),
('Davie504', 4, 'Epico. But needs more BASS options. Still, very useful for guitarists.', NOW() - INTERVAL '10 days'),
('BluesDad', 5, 'Used this for my gig last night. Dialed in a perfect SRV tone in seconds using my Strat and a Fender Deluxe Reverb. Saved me hours of tweaking.', NOW() - INTERVAL '1 day');
