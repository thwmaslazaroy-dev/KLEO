-- gen_random_uuid() is built-in on Postgres 13+ (Supabase default)

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  expo_push_token text,
  notification_push boolean default true,
  notification_email boolean default true,
  pin_hash text,
  biometric_enabled boolean default false,
  auto_lock_minutes int default 5,
  timezone text default 'Europe/Athens',
  shift_type text default 'fixed' check (shift_type in ('fixed', 'rotating')),
  shifts jsonb,
  current_shift_index int default 0,
  theme text default 'dark' check (theme in ('dark', 'light')),
  onboarding_done boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can manage own profile"
  on public.profiles for all
  using (auth.uid() = id);

-- Trigger: δημιουργεί profile μετά από signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CONTACTS
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  email text,
  phone text,
  company text,
  category text default 'clients',
  notes text,
  last_contact_at timestamptz,
  next_followup_at timestamptz,
  created_at timestamptz default now()
);

alter table public.contacts enable row level security;
create policy "Users can manage own contacts"
  on public.contacts for all
  using (auth.uid() = user_id);

-- TASKS
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  description text,
  category text not null check (category in ('university','bills','projects','clients','misc')),
  status text default 'pending' check (status in ('pending','in_progress','done','cancelled')),
  priority text default 'medium' check (priority in ('low','medium','high','urgent')),
  due_date timestamptz,
  reminder_at timestamptz,
  reminder_sent boolean default false,
  recurring text check (recurring in ('daily','weekly','monthly')),
  original_due_date timestamptz,
  overdue_days int default 0,
  rolled_over boolean default false,
  tags text[],
  contact_id uuid references public.contacts on delete set null,
  goal_id uuid,
  archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;
create policy "Users can manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id);

-- THOUGHTS
create table public.thoughts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  content text not null,
  linked_task_id uuid references public.tasks on delete set null,
  linked_goal_id uuid,
  category text default 'misc',
  archived boolean default false,
  created_at timestamptz default now()
);

alter table public.thoughts enable row level security;
create policy "Users can manage own thoughts"
  on public.thoughts for all
  using (auth.uid() = user_id);

-- EVENTS
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  description text,
  category text default 'misc',
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  contact_id uuid references public.contacts on delete set null,
  reminder_at timestamptz,
  reminder_sent boolean default false,
  archived boolean default false,
  created_at timestamptz default now()
);

alter table public.events enable row level security;
create policy "Users can manage own events"
  on public.events for all
  using (auth.uid() = user_id);

-- NOTES
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  title text,
  content text not null,
  category text default 'misc',
  tags text[],
  pinned boolean default false,
  archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.notes enable row level security;
create policy "Users can manage own notes"
  on public.notes for all
  using (auth.uid() = user_id);

-- AI INTERACTIONS LOG
create table public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  type text,
  prompt text,
  response text,
  tokens_input int,
  tokens_output int,
  created_at timestamptz default now()
);

alter table public.ai_interactions enable row level security;
create policy "Users can manage own ai_interactions"
  on public.ai_interactions for all
  using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at before update on public.tasks
  for each row execute procedure public.set_updated_at();
create trigger notes_updated_at before update on public.notes
  for each row execute procedure public.set_updated_at();
