-- supabase/migrations/001_jury_tables.sql
-- JuryActif — tables préfixées jury_ (projet Supabase partagé PLAI)

create table jury_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  mode text not null check (mode in ('A', 'B', 'C')),
  titre_tfe text not null,
  filiere text not null,
  niveau text,
  tfe_texte text not null,
  tfe_resume jsonb,
  duree_cible_min integer not null default 25,
  intensite text not null default 'standard' check (intensite in ('standard', 'approfondi')),
  label_eleve text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now() not null
);

create table jury_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ecole text,
  matiere text,
  niveau text,
  intitule text not null,
  type text not null check (type in ('paternite', 'comprehension', 'maitrise', 'piege', 'perso')),
  created_at timestamptz default now() not null
);

create table jury_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references jury_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rapport_json jsonb not null,
  label_eleve text,
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz default now() not null
);

-- RLS
alter table jury_sessions enable row level security;
alter table jury_questions enable row level security;
alter table jury_reports enable row level security;

create policy "users own sessions"
  on jury_sessions for all using (auth.uid() = user_id);

create policy "users own questions"
  on jury_questions for all using (auth.uid() = user_id);

create policy "users own reports"
  on jury_reports for all using (auth.uid() = user_id);

-- Fonction sécurisée pour l'accès public par token (bypasse RLS via security definer)
-- Utilisée par la page /r/[token] sans authentification
create or replace function jury_get_report_by_token(p_token text)
returns jury_reports
language sql
security definer
stable
as $$
  select * from jury_reports where share_token = p_token limit 1;
$$;
