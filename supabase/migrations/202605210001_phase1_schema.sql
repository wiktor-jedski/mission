create table public.teams (
  id text primary key,
  name text not null unique,
  pin_hash text not null,
  map_progress_count integer not null default 0 check (map_progress_count >= 0 and map_progress_count <= 21),
  completed_quest_count integer not null default 0 check (completed_quest_count >= 0 and completed_quest_count <= 25),
  created_at timestamptz not null default now()
);

create table public.quests (
  id text primary key,
  slug text not null unique check (slug ~ '^[a-z]+(-[a-z]+)+-[a-z0-9]{8}$'),
  title text not null,
  flavor_text text not null,
  instructions text not null,
  success_criteria text not null,
  safety_warning text not null,
  proof_kind text not null check (proof_kind in ('photo_link', 'video_link', 'audio_link', 'text_response')),
  hint_text text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.team_quest_progress (
  id text primary key,
  team_id text not null references public.teams(id) on delete cascade,
  quest_id text not null references public.quests(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'pending_review', 'approved', 'rejected', 'skipped')),
  hint_used_at timestamptz,
  approved_at timestamptz,
  skipped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, quest_id)
);

create table public.submissions (
  id text primary key,
  team_id text not null references public.teams(id) on delete cascade,
  quest_id text not null references public.quests(id) on delete cascade,
  contributor_name text not null,
  proof_kind text not null check (proof_kind in ('photo_link', 'video_link', 'audio_link', 'text_response')),
  proof_value text not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text check (rejection_reason in ('link_inaccessible', 'wrong_proof', 'quest_incomplete', 'other')),
  rejection_message text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create unique index submissions_one_active_per_team_quest
  on public.submissions (team_id, quest_id)
  where status in ('pending', 'approved');

create table public.audit_logs (
  id text primary key,
  actor_type text not null check (actor_type in ('team', 'admin', 'system')),
  actor_id text,
  action text not null check (action in ('submission_created', 'submission_approved', 'submission_rejected', 'progress_changed', 'seed_validated', 'schema_maintenance')),
  team_id text references public.teams(id) on delete set null,
  quest_id text references public.quests(id) on delete set null,
  submission_id text references public.submissions(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  id text primary key default 'global' check (id = 'global'),
  required_approval_count integer not null default 16 check (required_approval_count > 0 and required_approval_count <= 25),
  is_paused boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, required_approval_count, is_paused)
values ('global', 16, false);

create index quests_slug_idx on public.quests (slug);
create index submissions_pending_idx on public.submissions (submitted_at)
  where status = 'pending';
create index submissions_team_quest_idx on public.submissions (team_id, quest_id);
create index team_quest_progress_team_idx on public.team_quest_progress (team_id);
create index team_quest_progress_team_status_idx on public.team_quest_progress (team_id, status);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_team_created_at_idx on public.audit_logs (team_id, created_at desc);
