-- ==============================================================================
-- PRE-JAMB ACADEMY CBT — DEDICATED SUPABASE DATABASE SCHEMA
-- Execute this SQL script in your Pre-JAMB Supabase Project SQL Editor
-- ==============================================================================

-- 1. PRE-JAMB SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  default_question_count INTEGER DEFAULT 40,
  time_minutes INTEGER DEFAULT 40,
  is_active BOOLEAN DEFAULT TRUE,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRE-JAMB TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_topics (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES public.prejamb_subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRE-JAMB QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_questions (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES public.prejamb_subjects(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  topic TEXT,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer VARCHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D'
  explanation TEXT,
  marks INTEGER DEFAULT 1,
  difficulty VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'draft', 'archived'
  exam_year INTEGER DEFAULT 2024,
  source TEXT DEFAULT 'Pre-JAMB Bank',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prejamb_questions_subject ON public.prejamb_questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_prejamb_questions_status ON public.prejamb_questions(status);
CREATE INDEX IF NOT EXISTS idx_prejamb_questions_year ON public.prejamb_questions(exam_year);

-- 4. PRE-JAMB EXAMINATIONS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_examinations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_full_mock BOOLEAN DEFAULT FALSE,
  subject_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions_per_subject JSONB,
  duration_minutes INTEGER DEFAULT 120,
  pass_percentage INTEGER DEFAULT 50,
  instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  randomize_questions BOOLEAN DEFAULT TRUE,
  randomize_options BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRE-JAMB CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_candidates (
  id TEXT PRIMARY KEY,
  reg_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  target_university TEXT,
  target_course TEXT,
  utme_subjects JSONB DEFAULT '[]'::jsonb,
  subscription_status VARCHAR(20) DEFAULT 'active', -- 'active', 'free', 'expired', 'suspended'
  total_tests_taken INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  average_score INTEGER DEFAULT 0,
  total_time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prejamb_candidates_email ON public.prejamb_candidates(email);
CREATE INDEX IF NOT EXISTS idx_prejamb_candidates_reg ON public.prejamb_candidates(reg_number);

-- 6. PRE-JAMB RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_results (
  id TEXT PRIMARY KEY,
  candidate_id TEXT,
  candidate_name TEXT,
  candidate_reg_number TEXT,
  exam_title TEXT NOT NULL,
  is_full_mock BOOLEAN DEFAULT FALSE,
  subject_ids JSONB DEFAULT '[]'::jsonb,
  total_questions INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  utme_aggregate INTEGER DEFAULT 0, -- scaled to 400
  time_used_seconds INTEGER DEFAULT 0,
  subject_scores JSONB DEFAULT '{}'::jsonb,
  answers_by_subject JSONB DEFAULT '{}'::jsonb,
  marked_for_review JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prejamb_results_cand ON public.prejamb_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_prejamb_results_completed ON public.prejamb_results(completed_at DESC);

-- 7. PRE-JAMB SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_config',
  system_name TEXT DEFAULT 'Pre-JAMB Academy CBT Platform',
  enable_instant_results BOOLEAN DEFAULT TRUE,
  enable_answer_review BOOLEAN DEFAULT TRUE,
  enable_keyboard_shortcuts BOOLEAN DEFAULT TRUE,
  mock_exam_duration_minutes INTEGER DEFAULT 120,
  default_pass_percentage INTEGER DEFAULT 50,
  announcement_banner TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRE-JAMB ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.prejamb_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejamb_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejamb_examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejamb_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejamb_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejamb_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejamb_announcements ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for CBT practice & candidate portals
CREATE POLICY "Allow public read on prejamb_subjects" ON public.prejamb_subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read on prejamb_questions" ON public.prejamb_questions FOR SELECT USING (status = 'active');
CREATE POLICY "Allow public read on prejamb_examinations" ON public.prejamb_examinations FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read on prejamb_settings" ON public.prejamb_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read on prejamb_announcements" ON public.prejamb_announcements FOR SELECT USING (is_active = true);

-- Allow authenticated/anon candidates to record their test results
CREATE POLICY "Allow public insert on prejamb_results" ON public.prejamb_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read own results" ON public.prejamb_results FOR SELECT USING (true);

-- Allow service role / full admin access
CREATE POLICY "Admin full access on prejamb_subjects" ON public.prejamb_subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on prejamb_questions" ON public.prejamb_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on prejamb_examinations" ON public.prejamb_examinations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on prejamb_candidates" ON public.prejamb_candidates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on prejamb_settings" ON public.prejamb_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on prejamb_announcements" ON public.prejamb_announcements FOR ALL USING (true) WITH CHECK (true);
