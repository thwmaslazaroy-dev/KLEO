-- ALARMS
create table public.alarms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  label text,
  time time not null,
  days_of_week int[],
  enabled boolean default true,
  smart_alarm boolean default false,
  shift_offset_minutes int default 0,
  sound_type text default 'default' check (sound_type in ('default','file','spotify')),
  sound_uri text,
  snooze_minutes int default 9,
  vibrate boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.alarms enable row level security;
create policy "Users can manage own alarms"
  on public.alarms for all
  using (auth.uid() = user_id);

create trigger alarms_updated_at before update on public.alarms
  for each row execute procedure public.set_updated_at();

-- WORK SCHEDULES
create table public.work_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  label text,
  start_date date not null,
  end_date date,
  shift_type text not null check (shift_type in ('fixed','rotating')),
  shifts jsonb not null,
  rotation_weeks int default 1,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.work_schedules enable row level security;
create policy "Users can manage own work_schedules"
  on public.work_schedules for all
  using (auth.uid() = user_id);

-- USER INSIGHTS
create table public.user_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  key text not null,
  value jsonb not null,
  confidence float default 0.5,
  last_updated timestamptz default now(),
  created_at timestamptz default now(),
  unique (user_id, key)
);

alter table public.user_insights enable row level security;
create policy "Users can manage own user_insights"
  on public.user_insights for all
  using (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.thoughts;
alter publication supabase_realtime add table public.notes;
