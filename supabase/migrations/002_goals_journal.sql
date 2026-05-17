-- GOALS
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  description text,
  category text default 'misc',
  target_date timestamptz,
  status text default 'active' check (status in ('active','completed','paused','cancelled')),
  progress int default 0 check (progress between 0 and 100),
  archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.goals enable row level security;
create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id);

create trigger goals_updated_at before update on public.goals
  for each row execute procedure public.set_updated_at();

-- GOAL STEPS
create table public.goal_steps (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  done boolean default false,
  order_index int,
  created_at timestamptz default now()
);

alter table public.goal_steps enable row level security;
create policy "Users can manage own goal_steps"
  on public.goal_steps for all
  using (auth.uid() = user_id);

-- Add goal_id FK to tasks now that goals table exists
alter table public.tasks
  add constraint tasks_goal_id_fkey
  foreign key (goal_id) references public.goals on delete set null;

-- Add linked_goal_id FK to thoughts
alter table public.thoughts
  add constraint thoughts_linked_goal_id_fkey
  foreign key (linked_goal_id) references public.goals on delete set null;

-- JOURNAL ENTRIES
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  date date not null,
  content text,
  mood int check (mood between 1 and 5),
  highlights text[],
  tomorrow_focus text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, date)
);

alter table public.journal_entries enable row level security;
create policy "Users can manage own journal_entries"
  on public.journal_entries for all
  using (auth.uid() = user_id);

create trigger journal_updated_at before update on public.journal_entries
  for each row execute procedure public.set_updated_at();

-- WEEKLY REVIEWS
create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  week_start date not null,
  completed_tasks int,
  rolled_over_tasks int,
  mood_average numeric,
  reflection text,
  focus_next_week text,
  created_at timestamptz default now(),
  unique (user_id, week_start)
);

alter table public.weekly_reviews enable row level security;
create policy "Users can manage own weekly_reviews"
  on public.weekly_reviews for all
  using (auth.uid() = user_id);
