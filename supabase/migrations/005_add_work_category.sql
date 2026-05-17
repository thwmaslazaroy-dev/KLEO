-- Add 'work' to the category CHECK constraint on tasks, thoughts, events, notes, goals

ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_category_check,
  ADD CONSTRAINT tasks_category_check
    CHECK (category IN ('university','bills','projects','clients','work','misc'));

ALTER TABLE public.thoughts
  DROP CONSTRAINT IF EXISTS thoughts_category_check;

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_category_check;

ALTER TABLE public.notes
  DROP CONSTRAINT IF EXISTS notes_category_check;

ALTER TABLE public.goals
  DROP CONSTRAINT IF EXISTS goals_category_check;
