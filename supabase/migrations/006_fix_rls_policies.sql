-- Drop all existing policies and recreate cleanly for every table

-- ── PROFILES (uses id, not user_id) ──────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"    ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
CREATE POLICY "Users manage own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── TASKS ────────────────────────────────────────────────────────────
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"  ON public.tasks;
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── THOUGHTS ─────────────────────────────────────────────────────────
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"     ON public.thoughts;
DROP POLICY IF EXISTS "Users can manage own thoughts" ON public.thoughts;
CREATE POLICY "Users manage own thoughts"
  ON public.thoughts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── EVENTS ───────────────────────────────────────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"    ON public.events;
DROP POLICY IF EXISTS "Users can manage own events" ON public.events;
CREATE POLICY "Users manage own events"
  ON public.events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── NOTES ────────────────────────────────────────────────────────────
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"   ON public.notes;
DROP POLICY IF EXISTS "Users can manage own notes" ON public.notes;
CREATE POLICY "Users manage own notes"
  ON public.notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── CONTACTS ─────────────────────────────────────────────────────────
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"      ON public.contacts;
DROP POLICY IF EXISTS "Users can manage own contacts" ON public.contacts;
CREATE POLICY "Users manage own contacts"
  ON public.contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── GOALS ────────────────────────────────────────────────────────────
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"    ON public.goals;
DROP POLICY IF EXISTS "Users can manage own goals" ON public.goals;
CREATE POLICY "Users manage own goals"
  ON public.goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── GOAL STEPS ───────────────────────────────────────────────────────
ALTER TABLE public.goal_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"       ON public.goal_steps;
DROP POLICY IF EXISTS "Users can manage own goal_steps" ON public.goal_steps;
CREATE POLICY "Users manage own goal_steps"
  ON public.goal_steps FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── JOURNAL ENTRIES ──────────────────────────────────────────────────
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"           ON public.journal_entries;
DROP POLICY IF EXISTS "Users can manage own journal_entries" ON public.journal_entries;
CREATE POLICY "Users manage own journal_entries"
  ON public.journal_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── WEEKLY REVIEWS ────────────────────────────────────────────────────
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"          ON public.weekly_reviews;
DROP POLICY IF EXISTS "Users can manage own weekly_reviews" ON public.weekly_reviews;
CREATE POLICY "Users manage own weekly_reviews"
  ON public.weekly_reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── ALARMS ───────────────────────────────────────────────────────────
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"     ON public.alarms;
DROP POLICY IF EXISTS "Users can manage own alarms" ON public.alarms;
CREATE POLICY "Users manage own alarms"
  ON public.alarms FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── WORK SCHEDULES ───────────────────────────────────────────────────
ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"           ON public.work_schedules;
DROP POLICY IF EXISTS "Users can manage own work_schedules" ON public.work_schedules;
CREATE POLICY "Users manage own work_schedules"
  ON public.work_schedules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── USER INSIGHTS ─────────────────────────────────────────────────────
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"          ON public.user_insights;
DROP POLICY IF EXISTS "Users can manage own user_insights" ON public.user_insights;
CREATE POLICY "Users manage own user_insights"
  ON public.user_insights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── AI INTERACTIONS ───────────────────────────────────────────────────
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own data"            ON public.ai_interactions;
DROP POLICY IF EXISTS "Users can manage own ai_interactions" ON public.ai_interactions;
CREATE POLICY "Users manage own ai_interactions"
  ON public.ai_interactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
