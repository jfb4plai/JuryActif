-- supabase/migrations/002_jury_sessions_add_question_ids.sql
-- Ajoute la colonne selected_question_ids à jury_sessions
-- Stocke les IDs des questions personnalisées sélectionnées par l'enseignant

alter table jury_sessions
  add column if not exists selected_question_ids uuid[] not null default '{}';
