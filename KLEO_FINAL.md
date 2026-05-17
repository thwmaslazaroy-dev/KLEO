# Kleo — Claude Code Master Prompt (Final)

## Τι είναι το Kleo

Kleo είναι ο **προσωπικός βοηθός** του Tommy. Όχι γενικός AI assistant — ένας έμπιστος βοηθός που μαθαίνει τον Tommy, θυμάται τα πάντα, και τον βοηθάει να μην χάνει τίποτα. Ο Tommy είναι ξεχασιάρης με πολλές παράλληλες υποχρεώσεις (σχολή, λογαριασμοί, projects, πελάτες, προσωπικά).

**Το core πρόβλημα:** Τα πράγματα χάνονται. Ο Kleo είναι η εξωτερική μνήμη του Tommy — πάντα εκεί, πάντα ενημερωμένο, δεν κρίνει, δεν ξεχνάει.

**Tone:** Φιλικό, άμεσο, σαν καλός φίλος. Ελληνικά παντού. Όχι corporate — προσωπικό.

**Βασική αρχή UX:** Απλότητα πάνω από όλα. Ο Tommy δεν θέλει να σκέφτεται πώς δουλεύει η app.

---

## Identity

- **Όνομα:** Kleo (Κλειώ — μούσα της μνήμης)
- **Tagline:** "Θυμάμαι εγώ, εσύ απλά ζεις."
- **Χρώματα:**
  - Background: `#141E2E` → `#1E2D42`
  - Coral primary: `#E8523A` → `#F07850`
  - Teal secondary: `#2BB8B8` → `#2896D4`
  - Light: `#F0F2F5` → `#9AA5B8`
  - Accent dot: `#FFFFFF`
- **Fonts:** Sora (headings) + DM Sans (body)
- **Icon:** Rounded square, dark bg, K monogram (λευκή μπάρα + coral πάνω + teal κάτω + λευκή sphere dot)

---

## Tech Stack

| Layer | Tool | Κόστος |
|---|---|---|
| Web | Next.js 14 App Router | €0 Vercel |
| Mobile | Expo SDK 51 | €0 EAS |
| Backend | Supabase (Postgres + Auth + Realtime + Edge Functions) | €0 free tier |
| AI | Google Gemini 2.0 Flash | €0 1500 req/μέρα |
| Voice | Expo Speech device native | €0 online only |
| Push + Alarms | Expo Notifications | €0 local + server |
| Email | Resend | €0 3k/μήνα |
| Monorepo | Turborepo + pnpm | |
| State web | Zustand | |
| Offline | Expo SQLite + Supabase Realtime sync | |

**Σύνολο: €0/μέρα**

---

## Folder Structure

```
kleo/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (auth)/login/page.tsx
│   │   │   ├── (auth)/register/page.tsx
│   │   │   ├── (dashboard)/layout.tsx
│   │   │   ├── (dashboard)/page.tsx              # Today view
│   │   │   ├── (dashboard)/tasks/page.tsx
│   │   │   ├── (dashboard)/calendar/page.tsx
│   │   │   ├── (dashboard)/notes/page.tsx
│   │   │   ├── (dashboard)/thoughts/page.tsx
│   │   │   ├── (dashboard)/journal/page.tsx
│   │   │   ├── (dashboard)/goals/page.tsx
│   │   │   ├── (dashboard)/contacts/page.tsx
│   │   │   ├── (dashboard)/alarms/page.tsx
│   │   │   ├── (dashboard)/stats/page.tsx
│   │   │   ├── (dashboard)/archive/page.tsx
│   │   │   ├── (dashboard)/settings/page.tsx
│   │   │   └── api/
│   │   │       ├── ai/chat/route.ts
│   │   │       ├── ai/daily-brief/route.ts
│   │   │       ├── ai/weekly-review/route.ts
│   │   │       └── ai/prioritize/route.ts
│   │   ├── components/
│   │   │   ├── ui/           # Button, Input, Card, Badge, Modal, Toast
│   │   │   ├── tasks/        # TaskCard, TaskForm, TaskList, RolloverBadge
│   │   │   ├── calendar/     # EventCard, WeekView, ShiftPicker
│   │   │   ├── notes/        # NoteCard, NoteEditor
│   │   │   ├── thoughts/     # ThoughtCard, ThoughtStream
│   │   │   ├── journal/      # JournalEntry, MoodPicker
│   │   │   ├── goals/        # GoalCard, ProgressBar, StepList
│   │   │   ├── contacts/     # ContactCard, ContactForm
│   │   │   ├── alarms/       # AlarmCard, AlarmForm, SmartAlarmBadge
│   │   │   ├── stats/        # StreakCard, WeeklyChart
│   │   │   ├── ai/           # AIChatPanel, DailyBrief, WeeklyReview
│   │   │   └── layout/       # Sidebar, QuickCapture, OfflineBanner
│   │   ├── lib/
│   │   │   ├── supabase/client.ts
│   │   │   ├── supabase/server.ts
│   │   │   ├── gemini/client.ts      # ΜΟΝΟ εδώ AI calls
│   │   │   └── notifications/triggers.ts
│   │   ├── store/index.ts
│   │   └── middleware.ts
│   │
│   └── mobile/
│       ├── app/_layout.tsx           # Root: PIN check + push register
│       ├── app/pin.tsx               # PIN lock screen
│       ├── app/onboarding.tsx
│       ├── app/(auth)/login.tsx
│       ├── app/(auth)/register.tsx
│       ├── app/(tabs)/_layout.tsx
│       ├── app/(tabs)/index.tsx      # Today
│       ├── app/(tabs)/tasks.tsx
│       ├── app/(tabs)/calendar.tsx
│       ├── app/(tabs)/notes.tsx
│       ├── app/(tabs)/journal.tsx
│       ├── app/(tabs)/goals.tsx
│       ├── app/(tabs)/alarms.tsx
│       ├── components/QuickCapture.tsx
│       ├── components/OfflineBanner.tsx
│       ├── components/VoiceInput.tsx
│       ├── components/AlarmRinger.tsx
│       └── lib/
│           ├── supabase/client.ts
│           ├── sqlite/db.ts          # Offline
│           ├── security/pin.ts       # PIN + Biometric
│           ├── alarms/scheduler.ts   # Alarm scheduling
│           └── notifications/push.ts
│
├── packages/
│   ├── shared/
│   │   ├── types/index.ts
│   │   ├── utils/dates.ts
│   │   ├── utils/priorities.ts
│   │   ├── utils/rollover.ts
│   │   ├── utils/shifts.ts
│   │   └── constants/categories.ts
│   └── supabase/database.types.ts
│
├── supabase/
│   ├── migrations/001_initial_schema.sql
│   ├── migrations/002_goals_journal.sql
│   ├── migrations/003_alarms_insights.sql
│   ├── functions/notify-reminders/index.ts
│   └── functions/weekly-review-trigger/index.ts
│
├── KLEO_FINAL.md
├── turbo.json
├── package.json
└── .env.example
```

---

## Database Schema

```sql
-- PROFILES
profiles (
  id uuid PK refs auth.users,
  full_name text,
  expo_push_token text,
  notification_push boolean default true,
  notification_email boolean default true,
  pin_hash text,
  biometric_enabled boolean default false,
  auto_lock_minutes int default 5,
  timezone text default 'Europe/Athens',
  shift_type text default 'fixed',    -- 'fixed' | 'rotating'
  shifts jsonb,                        -- [{label,start,end,days?}, ...]
  current_shift_index int default 0,
  theme text default 'dark',
  onboarding_done boolean default false,
  created_at timestamptz default now()
)

-- USER INSIGHTS (adaptive learning)
user_insights (
  id uuid PK,
  user_id uuid refs profiles,
  key text NOT NULL,      -- 'productive_hours', 'forgets_bills', 'avg_tasks_per_day'
  value jsonb NOT NULL,   -- οποιαδήποτε τιμή
  confidence float default 0.5,   -- 0-1, αυξάνεται με χρήση
  last_updated timestamptz,
  created_at timestamptz
)
-- Παραδείγματα insights:
-- key: 'productive_hours', value: [8,9,10]
-- key: 'avg_daily_tasks_completed', value: 4
-- key: 'most_delayed_category', value: 'bills'
-- key: 'typical_wake_time', value: '07:30'

-- WORK SCHEDULE (ωράριο με ημερομηνίες)
work_schedules (
  id uuid PK,
  user_id uuid refs profiles,
  label text,                    -- "Καλοκαίρι 2025", "Χειμώνας"
  start_date date NOT NULL,
  end_date date,                 -- null = indefinite
  shift_type text NOT NULL,      -- 'fixed' | 'rotating'
  shifts jsonb NOT NULL,         -- [{label,start,end}, ...]
  rotation_weeks int default 1,  -- κάθε πόσες εβδομάδες αλλάζει
  is_active boolean default true,
  created_at timestamptz
)

-- ALARMS
alarms (
  id uuid PK,
  user_id uuid refs profiles,
  label text,                    -- "Ξύπνημα", "Φάρμακο", "Meeting prep"
  time time NOT NULL,            -- "07:00"
  days_of_week int[],            -- [1,2,3,4,5] (1=Δευτ, 7=Κυρ), null=κάθε μέρα
  enabled boolean default true,
  -- Smart alarm
  smart_alarm boolean default false,  -- αλλάζει με βάρδια αυτόματα
  shift_offset_minutes int default 0, -- π.χ. 30 λεπτά πριν βάρδια
  -- Sound (Phase 6)
  sound_type text default 'default',  -- 'default' | 'file' | 'spotify'
  sound_uri text,                     -- path ή spotify URI
  -- Snooze
  snooze_minutes int default 9,
  vibrate boolean default true,
  created_at timestamptz,
  updated_at timestamptz
)

-- CONTACTS
contacts (
  id uuid PK,
  user_id uuid refs profiles,
  name text NOT NULL,
  email text, phone text, company text,
  category text default 'clients',
  notes text,
  last_contact_at timestamptz,
  next_followup_at timestamptz,
  created_at timestamptz
)

-- TASKS
tasks (
  id uuid PK,
  user_id uuid refs profiles,
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('university','bills','projects','clients','misc')),
  status text default 'pending' CHECK (status IN ('pending','in_progress','done','cancelled')),
  priority text default 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  due_date timestamptz,
  reminder_at timestamptz,
  reminder_sent boolean default false,
  recurring text CHECK (recurring IN ('daily','weekly','monthly')),
  original_due_date timestamptz,
  overdue_days int default 0,
  rolled_over boolean default false,
  tags text[],
  contact_id uuid refs contacts,
  goal_id uuid refs goals,
  archived boolean default false,
  created_at timestamptz,
  updated_at timestamptz
)

-- THOUGHTS
thoughts (
  id uuid PK,
  user_id uuid refs profiles,
  content text NOT NULL,
  linked_task_id uuid refs tasks,
  linked_goal_id uuid refs goals,
  category text default 'misc',
  archived boolean default false,
  created_at timestamptz
)

-- EVENTS
events (
  id uuid PK,
  user_id uuid refs profiles,
  title text NOT NULL,
  description text,
  category text default 'misc',
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  location text,
  contact_id uuid refs contacts,
  reminder_at timestamptz,
  reminder_sent boolean default false,
  archived boolean default false,
  created_at timestamptz
)

-- NOTES
notes (
  id uuid PK,
  user_id uuid refs profiles,
  title text, content text NOT NULL,
  category text default 'misc',
  tags text[], pinned boolean default false,
  archived boolean default false,
  created_at timestamptz, updated_at timestamptz
)

-- JOURNAL
journal_entries (
  id uuid PK,
  user_id uuid refs profiles,
  date date NOT NULL,
  content text,
  mood int CHECK (mood BETWEEN 1 AND 5),
  highlights text[],
  tomorrow_focus text,
  created_at timestamptz, updated_at timestamptz
)

-- GOALS
goals (
  id uuid PK,
  user_id uuid refs profiles,
  title text NOT NULL, description text,
  category text default 'misc',
  target_date timestamptz,
  status text default 'active' CHECK (status IN ('active','completed','paused','cancelled')),
  progress int default 0 CHECK (progress BETWEEN 0 AND 100),
  archived boolean default false,
  created_at timestamptz, updated_at timestamptz
)

-- GOAL STEPS
goal_steps (
  id uuid PK,
  goal_id uuid refs goals,
  user_id uuid refs profiles,
  title text NOT NULL,
  done boolean default false,
  order_index int,
  created_at timestamptz
)

-- WEEKLY REVIEWS
weekly_reviews (
  id uuid PK,
  user_id uuid refs profiles,
  week_start date NOT NULL,
  completed_tasks int,
  rolled_over_tasks int,
  mood_average numeric,
  reflection text,
  focus_next_week text,
  created_at timestamptz
)

-- AI LOG
ai_interactions (
  id uuid PK,
  user_id uuid refs profiles,
  type text,
  prompt text, response text,
  tokens_input int, tokens_output int,
  created_at timestamptz
)
```

**RLS:** Κάθε table: `auth.uid() = user_id`. Πάντα enabled.

---

## Shared Types

```typescript
// packages/shared/types/index.ts

export type Category = 'university' | 'bills' | 'projects' | 'clients' | 'misc'
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type RecurringType = 'daily' | 'weekly' | 'monthly' | null
export type ShiftType = 'fixed' | 'rotating'

export interface Shift {
  label: string    // "Πρωί"
  start: string    // "06:00"
  end: string      // "14:00"
}

export interface WorkSchedule {
  id: string
  user_id: string
  label: string
  start_date: string
  end_date?: string
  shift_type: ShiftType
  shifts: Shift[]
  rotation_weeks: number
  is_active: boolean
  created_at: string
}

export interface Alarm {
  id: string
  user_id: string
  label?: string
  time: string              // "07:00"
  days_of_week?: number[]   // [1,2,3,4,5]
  enabled: boolean
  smart_alarm: boolean
  shift_offset_minutes: number
  sound_type: 'default' | 'file' | 'spotify'
  sound_uri?: string
  snooze_minutes: number
  vibrate: boolean
  created_at: string
  updated_at: string
}

export interface UserInsight {
  id: string
  user_id: string
  key: string
  value: unknown
  confidence: number
  last_updated: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  category: Category
  status: TaskStatus
  priority: Priority
  due_date?: string
  reminder_at?: string
  reminder_sent: boolean
  recurring?: RecurringType
  original_due_date?: string
  overdue_days: number
  rolled_over: boolean
  tags?: string[]
  contact_id?: string
  goal_id?: string
  archived: boolean
  created_at: string
  updated_at: string
}

export interface Thought {
  id: string
  user_id: string
  content: string
  linked_task_id?: string
  linked_goal_id?: string
  category: Category
  archived: boolean
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  date: string
  content?: string
  mood?: 1 | 2 | 3 | 4 | 5
  highlights?: string[]
  tomorrow_focus?: string
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  category: Category
  target_date?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  progress: number
  steps?: GoalStep[]
  archived: boolean
  created_at: string
  updated_at: string
}

export interface GoalStep {
  id: string
  goal_id: string
  user_id: string
  title: string
  done: boolean
  order_index: number
  created_at: string
}

export interface Profile {
  id: string
  full_name?: string
  expo_push_token?: string
  notification_push: boolean
  notification_email: boolean
  pin_hash?: string
  biometric_enabled: boolean
  auto_lock_minutes: number
  timezone: string
  shift_type: ShiftType
  shifts?: Shift[]
  current_shift_index: number
  theme: 'dark' | 'light'
  onboarding_done: boolean
}
```

---

## Startup Context (φορτώνεται σε κάθε AI call)

```typescript
// lib/gemini/context.ts
// Αυτό στέλνεται σε ΚΑΘΕ AI call — ο Kleo ξέρει πάντα ποιος είναι ο Tommy

export async function buildUserContext(userId: string) {
  const [profile, tasks, events, goals, thoughts, insights, schedule] =
    await Promise.all([
      getProfile(userId),
      getTasks(userId),
      getTodaysEvents(userId),
      getActiveGoals(userId),
      getRecentThoughts(userId, 3),
      getUserInsights(userId),
      getActiveSchedule(userId),
    ])

  const now = new Date()

  return {
    // Ποιος είναι
    name: profile.full_name,                    // "Tommy"
    timezone: profile.timezone,                  // "Europe/Athens"

    // Πότε είναι
    current_datetime: now.toLocaleString('el-GR'),
    day_of_week: now.toLocaleDateString('el-GR', { weekday: 'long' }),  // "Τρίτη"

    // Ωράριο
    current_shift: getCurrentShift(schedule),    // "Απόγευμα 14:00-22:00"
    next_shift: getNextShift(schedule),

    // Τι έχει τώρα
    overdue_tasks: tasks.filter(t => t.overdue_days > 0)
                        .sort((a,b) => b.overdue_days - a.overdue_days),
    todays_tasks: tasks.filter(t => isToday(t.due_date)),
    todays_events: events,
    active_goals: goals.map(g => ({
      title: g.title,
      progress: g.progress,
      next_step: g.steps?.find(s => !s.done)?.title
    })),
    recent_thoughts: thoughts.map(t => t.content),

    // Τι έχει μάθει για τον Tommy
    insights: {
      productive_hours: insights.find(i => i.key === 'productive_hours')?.value,
      avg_daily_tasks: insights.find(i => i.key === 'avg_daily_tasks_completed')?.value,
      most_delayed_category: insights.find(i => i.key === 'most_delayed_category')?.value,
    }
  }
}
```

---

## Adaptive Learning

```typescript
// Μετά από κάθε interaction, ο Kleo ενημερώνει τα insights
// supabase/functions/update-insights/index.ts

async function updateInsights(userId: string) {
  const tasks = await getAllTasks(userId)
  const completed = tasks.filter(t => t.status === 'done')
  const journal = await getJournalEntries(userId, 30)

  const insights = [
    {
      key: 'avg_daily_tasks_completed',
      value: calculateAvgDaily(completed),
    },
    {
      key: 'most_delayed_category',
      value: getMostDelayedCategory(tasks),
    },
    {
      key: 'avg_mood',
      value: calculateAvgMood(journal),
    },
    {
      key: 'completion_rate',
      value: completed.length / tasks.length,
    },
  ]

  // Upsert στο user_insights
  for (const insight of insights) {
    await supabase.from('user_insights').upsert({
      user_id: userId,
      ...insight,
      last_updated: new Date().toISOString(),
    }, { onConflict: 'user_id,key' })
  }
}
```

---

## AI Client

```typescript
// apps/web/lib/gemini/client.ts
// ΚΑΝΟΝΑΣ: Όλα τα AI calls περνούν από εδώ.

export type AIRequestType =
  | 'chat'
  | 'daily_brief'
  | 'weekly_review'
  | 'prioritize'
  | 'draft_email'
  | 'parse_voice'

const PROMPTS: Record<AIRequestType, (ctx: object) => string> = {

  chat: (ctx) => `Είσαι ο Kleo, ο προσωπικός βοηθός του Tommy.
Ο Tommy είναι ξεχασιάρης με πολλές υποχρεώσεις — τον βοηθάς να μην χάνει τίποτα.
Είσαι φιλικός, άμεσος, σαν καλός φίλος. Ελληνικά πάντα. Σύντομος και πρακτικός.
Χρησιμοποίησε αυτά που ξέρεις για τον Tommy για να δίνεις προσωπικές απαντήσεις.
Context: ${JSON.stringify(ctx)}`,

  daily_brief: (ctx) => `Είσαι ο Kleo. Πρωινό briefing για τον Tommy.
Ξεκίνα "Καλημέρα Tommy!" + μια ζεστή προσωπική παρατήρηση βάσει των insights.
Μετά: overdue (με έμφαση), τι έχει σήμερα, TOP 1 πράγμα να κάνει πρώτο.
5-6 γραμμές max. Ελληνικά.
Context: ${JSON.stringify(ctx)}`,

  weekly_review: (ctx) => `Είσαι ο Kleo. Weekly review κάθε Κυριακή.
Τόνος: ζεστός, ενθαρρυντικός. Γιόρταζε τα successes, μην κρίνεις τα fails.
Δομή: τι πήγε καλά → τι μετακινείται → focus επόμενη εβδομάδα.
Ελληνικά. Context: ${JSON.stringify(ctx)}`,

  prioritize: (ctx) => `Είσαι ο Kleo. TOP 3 tasks για ΣΗΜΕΡΑ και γιατί.
Λάβε υπόψη το ωράριο και τα insights για τον Tommy.
Σύντομο, χωρίς φλυαρία. Ελληνικά.
Context: ${JSON.stringify(ctx)}`,

  draft_email: (ctx) => `Είσαι ο Kleo. Γράφεις email για τον Tommy.
Επαγγελματικό αλλά ζεστό ύφος. Ελληνικά.
Context: ${JSON.stringify(ctx)}`,

  parse_voice: (_ctx) => `Μετέτρεψε αυτή τη φωνητική εντολή σε JSON task.
Επέστρεψε ΜΟΝΟ JSON:
{"title":string,"category":"university"|"bills"|"projects"|"clients"|"misc","priority":"low"|"medium"|"high"|"urgent","due_date":"YYYY-MM-DD"|null,"reminder_at":"YYYY-MM-DDTHH:mm"|null}`,
}

export async function callGemini({ type, userMessage, context = {} }: {
  type: AIRequestType
  userMessage: string
  context?: object
}): Promise<string> {
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages: [
          { role: 'system', content: PROMPTS[type](context) },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 1000,
      }),
    }
  )
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}
```

---

## Alarm System

```typescript
// apps/mobile/lib/alarms/scheduler.ts
import * as Notifications from 'expo-notifications'

// Ορισμός ξυπνητηριού
export async function scheduleAlarm(alarm: Alarm) {
  // Αν είναι smart alarm — υπολόγισε ώρα βάσει βάρδιας
  const alarmTime = alarm.smart_alarm
    ? getShiftStartTime(alarm.shift_offset_minutes)
    : alarm.time

  await Notifications.scheduleNotificationAsync({
    identifier: `alarm_${alarm.id}`,
    content: {
      title: '⏰ ' + (alarm.label ?? 'Ξυπνητήρι'),
      body: 'Kleo — ' + alarmTime,
      sound: true,
      vibrate: alarm.vibrate ? [0, 500, 200, 500] : undefined,
      data: { alarmId: alarm.id, type: 'alarm' },
    },
    trigger: {
      type: alarm.days_of_week?.length
        ? 'weekly'   // συγκεκριμένες μέρες
        : 'daily',   // κάθε μέρα
      hour: parseInt(alarmTime.split(':')[0]),
      minute: parseInt(alarmTime.split(':')[1]),
      repeats: true,
    },
  })
}

// Snooze
export async function snoozeAlarm(alarmId: string, minutes: number) {
  await Notifications.scheduleNotificationAsync({
    identifier: `snooze_${alarmId}`,
    content: { title: '⏰ Snooze', body: `+${minutes} λεπτά`, sound: true },
    trigger: { seconds: minutes * 60 },
  })
}

// Ακύρωση
export async function cancelAlarm(alarmId: string) {
  await Notifications.cancelScheduledNotificationAsync(`alarm_${alarmId}`)
}

// Phase 6: Sound από αρχείο ή Spotify
export async function scheduleAlarmWithMusic(alarm: Alarm) {
  if (alarm.sound_type === 'file' && alarm.sound_uri) {
    // Expo AV για local αρχείο
    const { sound } = await Audio.Sound.createAsync({ uri: alarm.sound_uri })
    await sound.playAsync()
  } else if (alarm.sound_type === 'spotify' && alarm.sound_uri) {
    // Άνοιγμα Spotify
    await Linking.openURL(alarm.sound_uri)
  }
}
```

---

## Work Schedule System

```typescript
// Προσθήκη ωραρίου για συγκεκριμένη περίοδο
interface AddScheduleInput {
  label: string           // "Καλοκαίρι 2025"
  start_date: string      // "2025-06-15"
  end_date?: string       // "2025-09-01" ή null για αόριστο
  shift_type: ShiftType
  shifts: Shift[]
  rotation_weeks?: number
}

// Παραδείγματα:
// Κυλιόμενο 3 βαρδιών:
// shifts: [{label:'Πρωί',start:'06:00',end:'14:00'},
//          {label:'Απόγευμα',start:'14:00',end:'22:00'},
//          {label:'Βράδυ',start:'22:00',end:'06:00'}]
// rotation_weeks: 1

// Σταθερό:
// shifts: [{label:'Πρωί',start:'08:00',end:'16:00'}]
// shift_type: 'fixed'

// Το app βρίσκει αυτόματα ποια βάρδια ισχύει ΤΩΡΑ
export function getCurrentShift(schedule: WorkSchedule): Shift | null {
  if (!schedule) return null
  if (schedule.shift_type === 'fixed') return schedule.shifts[0]

  const weeksSinceStart = Math.floor(
    (Date.now() - new Date(schedule.start_date).getTime())
    / (1000 * 60 * 60 * 24 * 7)
  )
  const index = weeksSinceStart % schedule.shifts.length
  return schedule.shifts[index]
}
```

---

## PIN & Security

```typescript
// apps/mobile/lib/security/pin.ts
import * as SecureStore from 'expo-secure-store'
import * as LocalAuthentication from 'expo-local-authentication'
import * as Crypto from 'expo-crypto'

const hash = (pin: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin)

export const setPIN = async (pin: string) =>
  SecureStore.setItemAsync('kleo_pin', await hash(pin))

export const hasPIN = async () =>
  !!(await SecureStore.getItemAsync('kleo_pin'))

export const verifyPIN = async (input: string): Promise<boolean> => {
  const stored = await SecureStore.getItemAsync('kleo_pin')
  return !!stored && (await hash(input)) === stored
}

export const verifyBiometric = async (): Promise<boolean> => {
  if (!(await LocalAuthentication.hasHardwareAsync())) return false
  const r = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Kleo — Επιβεβαίωση ταυτότητας',
    fallbackLabel: 'Χρήση PIN',
  })
  return r.success
}

// Flow:
// App open/foreground → hasPIN?
//   ΝΑΙ → biometric πρώτα → αν fail → PIN screen
//         Λάθος 3x → αναμονή 30 δευτ.
//   ΟΧΙ → Onboarding → Setup PIN
```

---

## Offline / Online Matrix

| Feature | Offline | Online |
|---|---|---|
| Tasks, Notes, Thoughts, Journal, Goals, Contacts, Calendar | ✅ | ✅ |
| Alarms / Ξυπνητήρια | ✅ | ✅ |
| PIN / Biometric | ✅ | ✅ |
| Local push notifications | ✅ | ✅ |
| Search | ✅ | ✅ |
| Sync μεταξύ συσκευών | ❌ | ✅ |
| AI Daily Brief | ❌ | ✅ |
| AI Chat | ❌ | ✅ |
| AI Weekly Review | ❌ | ✅ |
| Voice input | ❌ → Toast "Χρειάζεται σύνδεση" | ✅ |
| Email notifications | ❌ | ✅ |
| Adaptive learning sync | ❌ | ✅ |

---

## Rollover Logic

```typescript
// packages/shared/utils/rollover.ts
export function processRollovers(tasks: Task[]): Task[] {
  const today = new Date()
  today.setHours(0,0,0,0)
  return tasks.map(task => {
    if (task.status === 'pending' && task.due_date && new Date(task.due_date) < today) {
      return {
        ...task,
        rolled_over: true,
        overdue_days: Math.floor(
          (today.getTime() - new Date(task.original_due_date ?? task.due_date).getTime())
          / (1000 * 60 * 60 * 24)
        )
      }
    }
    return task
  })
}

// Today view order:
// 1. Overdue (overdue_days DESC) — κόκκινο badge
// 2. Due today (priority order)
// 3. Thoughts
// 4. Goals snapshot
```

---

## Today View

```
⏰  [Smart alarm badge — επόμενο ξυπνητήρι]

☀️  Καλημέρα Tommy!
    [AI Daily Brief — 5-6 γραμμές, προσωπικό]
    [Τρέχουσα βάρδια + quick switch button]

🔴  Καθυστερούν
    • Στείλε προσφορά Γιώργη  [+2 μέρες]
    • Πλήρωσε ΔΕΗ             [+1 μέρα]

📌  Σήμερα
    • Meeting Νίκος  10:00
    • Παράδοση project  23:59

💭  Σκέψεις
    • "Να δω αν αξίζει landing page..."

🎯  Goals
    • Πτυχίο: 60% ████████░░

[Quick Capture — floating button, πάντα ορατό]
```

---

## Onboarding Flow

```
1. "Γεια! Είμαι ο Kleo, ο βοηθός σου. Θυμάμαι εγώ, εσύ απλά ζεις."
2. "Πώς να σε λέω;" → full_name
3. "Πώς δουλεύεις;" → Fixed ή κυλιόμενο
4. Ορισμός βαρδιών + ημερομηνίες
5. "Ποιες κατηγορίες χρησιμοποιείς;" (pre-selected όλες)
6. "Βάλε ένα PIN για την ασφάλειά σου"
7. Biometric setup αν διαθέσιμο
8. Notifications permission
9. Πρώτο ξυπνητήρι — "Θέλεις να σε ξυπνώ εγώ;"
10. "Πάμε! Τι έχεις πρώτο;" → Quick Capture
```

---

## Notification Pipeline

```
[Local — Offline — Expo scheduleNotificationAsync]
→ Reminders, alarms — δουλεύουν χωρίς internet

[Server Cron — κάθε 5 λεπτά]
Edge Function: notify-reminders
→ tasks/events WHERE reminder_at <= now AND reminder_sent = false
→ Expo Push + Resend email
→ UPDATE reminder_sent = true

[Weekly Cron — Κυριακή 20:00 EET]
Edge Function: weekly-review-trigger
→ Push: "Έλα να δούμε την εβδομάδα μαζί 📊"

[Shift-aware]
Δεν στέλνει notifications εκτός ωραρίου (εκτός urgent + alarms)
```

---

## Constants

```typescript
export const CATEGORIES = {
  university: { label: 'Σχολή',       emoji: '📚', color: '#6366f1' },
  bills:      { label: 'Λογαριασμοί', emoji: '💰', color: '#f59e0b' },
  projects:   { label: 'Projects',    emoji: '🚀', color: '#10b981' },
  clients:    { label: 'Πελάτες',     emoji: '👥', color: '#3b82f6' },
  misc:       { label: 'Λοιπά',       emoji: '📌', color: '#8b5cf6' },
}

export const MOOD_LABELS = {
  1: { label: 'Πολύ κακά',  emoji: '😔' },
  2: { label: 'Κακά',       emoji: '😕' },
  3: { label: 'Μέτρια',     emoji: '😐' },
  4: { label: 'Καλά',       emoji: '🙂' },
  5: { label: 'Εξαιρετικά', emoji: '😄' },
}
```

---

## Coding Rules

**TypeScript:** strict mode, μηδέν any, όλα τα types από @kleo/shared

**Supabase:** server client σε RSC/API routes, browser client σε Client Components, service role ΜΟΝΟ Edge Functions, RLS ποτέ παρακάμπτεται

**AI:** ΜΟΝΟ μέσω lib/gemini/client.ts, πάντα buildUserContext() πριν call, πάντα log ai_interactions, πάντα check internet, πάντα try/catch

**UX:**
- Απλότητα πάνω από όλα
- Quick Capture floating button παντού
- Offline banner subtle
- Ελληνικά παντού
- Dark mode default
- Haptic feedback: task complete, PIN, alarm dismiss
- Animations: subtle, satisfying
- Snooze με swipe gesture

**Error pattern:**
```typescript
try {
  const result = await operation()
  return NextResponse.json({ data: result })
} catch (error) {
  console.error('[route]:', error)
  return NextResponse.json({ error: 'Κάτι πήγε στραβά' }, { status: 500 })
}
```

**Naming:** files kebab-case, components PascalCase, functions camelCase, DB snake_case

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=           # aistudio.google.com/app/apikey

RESEND_API_KEY=           # resend.com

NEXT_PUBLIC_APP_URL=http://localhost:3000

EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Phase Roadmap

**Phase 1 — Foundation**
- Monorepo (Turborepo + pnpm)
- Supabase migrations
- Auth web + mobile
- Onboarding
- PIN + Biometric
- Tasks CRUD + Rollover
- Today dashboard

**Phase 2 — Core Modules**
- Calendar + Events
- Notes + Thoughts
- Journal + Mood
- Offline SQLite
- Realtime sync

**Phase 3 — Goals, Stats, Archive**
- Goals + Steps + Progress
- Stats (streaks, charts, category breakdown)
- Weekly Review (Κυριακή)
- Archive

**Phase 4 — Ωράριο & Ξυπνητήρια**
- Work Schedule system (με ημερομηνίες)
- Smart alarms (βάσει βάρδιας)
- Shift-aware notifications
- Alarm UI (snooze, vibrate)

**Phase 5 — Notifications & AI**
- Local push (offline)
- Email Resend
- Cron functions
- Gemini client + buildUserContext
- Daily brief, prioritize, voice, weekly review
- Adaptive learning (user_insights)

**Phase 6 — Polish**
- Home screen widget
- Export/Backup JSON
- Full-text search
- Animations + haptics
- Theme toggle
- Alarm music (Expo AV + Spotify deep link)

---

## Commands

```bash
pnpm --filter web dev
pnpm --filter mobile start

supabase start
supabase db push
supabase gen types typescript --local > packages/supabase/database.types.ts
supabase functions deploy notify-reminders
supabase functions deploy weekly-review-trigger

eas build --platform ios
eas build --platform android
```

---

## Κόστος: €0/μέρα

Supabase free | Vercel free | Gemini Flash free | Expo Push free | Resend free
