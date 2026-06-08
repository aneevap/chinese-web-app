-- ============================================================
--  🐼 学汉字  Supabase Schema
--  Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. PROFILES -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  TEXT PRIMARY KEY,
  nickname            TEXT NOT NULL,
  avatar              TEXT NOT NULL DEFAULT '🐼',
  color               TEXT NOT NULL DEFAULT '#FFB347',
  is_guest            BOOLEAN DEFAULT true,
  equipped_items      JSONB DEFAULT '{}',
  coins               INTEGER DEFAULT 0,
  coins_earned_total  INTEGER DEFAULT 0,
  coins_sources       JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. SCORES (daily) -------------------------------------------
CREATE TABLE IF NOT EXISTS public.scores (
  id              BIGSERIAL PRIMARY KEY,
  profile_id      TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  write_score     INTEGER DEFAULT 0,
  study_score     INTEGER DEFAULT 0,
  chars_practiced TEXT[] DEFAULT '{}',
  cards_studied   TEXT[] DEFAULT '{}',
  badge           TEXT,
  study_badge     TEXT,
  write_attempts  JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, date)
);

-- 3. WORD MASTERY ---------------------------------------------
CREATE TABLE IF NOT EXISTS public.mastery (
  id              BIGSERIAL PRIMARY KEY,
  profile_id      TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  word_id         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'unseen',
  write_cleared   BOOLEAN DEFAULT false,
  quiz_cleared    BOOLEAN DEFAULT false,
  mastered_date   TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, word_id)
);

-- 4. ITEMS ---------------------------------------------------
-- Single row per profile with JSONB earned[] and equipped{category: itemId}
CREATE TABLE IF NOT EXISTS public.items (
  profile_id      TEXT PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  earned          JSONB DEFAULT '[]',
  equipped        JSONB DEFAULT '{}'
);


-- 5. NOTEBOOK (user's personal word notebook) -------------------
CREATE TABLE IF NOT EXISTS public.notebook (
  id              BIGSERIAL PRIMARY KEY,
  profile_id      TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  word_id         TEXT NOT NULL,
  char            TEXT DEFAULT '',
  pinyin          TEXT DEFAULT '',
  meaning         TEXT DEFAULT '',
  meaning_th      TEXT DEFAULT '',
  note            TEXT DEFAULT '',
  added_at        TEXT,
  updated_at      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, word_id)
);

-- 6. HALL OF FAME (game leaderboards) --------------------------
-- Each game session creates a new row. session_id is a hash of
-- profileId + gameId + updatedAt to avoid duplicate pushes.
CREATE TABLE IF NOT EXISTS public.hall_of_fame (
  session_id      TEXT PRIMARY KEY,
  profile_id      TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id         TEXT NOT NULL,
  nickname        TEXT NOT NULL,
  avatar          TEXT NOT NULL DEFAULT '🐼',
  best_stars      INTEGER DEFAULT 0,
  best_score      INTEGER DEFAULT 0,
  best_stage      INTEGER DEFAULT 0,
  updated_at      BIGINT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
--  MIGRATION: Add new columns to existing tables
--  Run these if the tables already exist without the new columns
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins               INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins_earned_total  INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins_sources       JSONB DEFAULT '{}';
ALTER TABLE public.notebook   ADD COLUMN IF NOT EXISTS meaning_th        TEXT DEFAULT '';


-- ============================================================
--  ROW LEVEL SECURITY
--  Currently open for all operations (anonymous users).
--  Tighten these policies when you add real user authentication.
-- ============================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_of_fame   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook        ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (anonymous auth)
CREATE POLICY "Allow all on profiles"       ON public.profiles       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on scores"         ON public.scores         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on mastery"        ON public.mastery        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on items"          ON public.items          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on notebook"      ON public.notebook        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on hall_of_fame"   ON public.hall_of_fame   FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
--  INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_scores_profile_date   ON public.scores(profile_id, date);
CREATE INDEX IF NOT EXISTS idx_mastery_profile_word  ON public.mastery(profile_id, word_id);
CREATE INDEX IF NOT EXISTS idx_items_profile         ON public.items(profile_id);
CREATE INDEX IF NOT EXISTS idx_hof_game_score        ON public.hall_of_fame(game_id, best_score DESC);
CREATE INDEX IF NOT EXISTS idx_hof_profile            ON public.hall_of_fame(profile_id);
CREATE INDEX IF NOT EXISTS idx_notebook_profile_word   ON public.notebook(profile_id, word_id);
