-- OpportunityRadar Supabase Database Schema
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Create opportunities table
CREATE TABLE IF NOT EXISTS public.opportunities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  eligibility JSONB NOT NULL DEFAULT '{}'::jsonb,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  education_levels TEXT[] NOT NULL DEFAULT '{}',
  format TEXT NOT NULL,
  location TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  deadline_timezone TEXT,
  official_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_status TEXT NOT NULL DEFAULT 'Verified',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  participation_cost TEXT NOT NULL DEFAULT 'Free',
  stipend_or_prize TEXT,
  application_steps TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  required_documents TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY DEFAULT 'default-user',
  interests TEXT[] NOT NULL DEFAULT '{"AI/ML", "Python", "Web Development"}',
  skills TEXT[] NOT NULL DEFAULT '{"Python", "React", "Git"}',
  education_level TEXT NOT NULL DEFAULT 'Undergraduate',
  preferred_categories TEXT[] NOT NULL DEFAULT '{"Hackathon", "Internship"}',
  preferred_format TEXT NOT NULL DEFAULT 'Any',
  preferred_location TEXT NOT NULL DEFAULT 'Global / Remote',
  prefers_free_opportunities BOOLEAN NOT NULL DEFAULT TRUE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create saved opportunities table
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

-- 4. Create applications pipeline table
CREATE TABLE IF NOT EXISTS public.applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default-user',
  opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Interested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  next_action TEXT DEFAULT '',
  next_action_date DATE
);

-- 5. Enable Row Level Security (RLS) with permissive anon policies for MVP
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Allow anon write opportunities" ON public.opportunities FOR ALL USING (true);

CREATE POLICY "Allow anon read user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow anon write user_profiles" ON public.user_profiles FOR ALL USING (true);

CREATE POLICY "Allow anon read saved_opportunities" ON public.saved_opportunities FOR SELECT USING (true);
CREATE POLICY "Allow anon write saved_opportunities" ON public.saved_opportunities FOR ALL USING (true);

CREATE POLICY "Allow anon read applications" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Allow anon write applications" ON public.applications FOR ALL USING (true);

-- 6. Insert initial baseline user profile
INSERT INTO public.user_profiles (id, education_level, interests, skills, preferred_categories, preferred_format, preferred_location, prefers_free_opportunities, onboarding_completed)
VALUES (
  'default-user',
  'Undergraduate',
  ARRAY['AI/ML', 'Python', 'Web Development', 'Hackathons'],
  ARRAY['Python', 'React', 'Git', 'TypeScript'],
  ARRAY['Hackathon', 'Internship', 'Fellowship'],
  'Any',
  'Global / Remote',
  TRUE,
  TRUE
)
ON CONFLICT (id) DO NOTHING;
