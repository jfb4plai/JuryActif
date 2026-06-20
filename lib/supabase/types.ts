// lib/supabase/types.ts
// JuryActif — types TypeScript pour les tables Supabase

export type QuestionType = 'paternite' | 'comprehension' | 'maitrise' | 'piege' | 'perso'
export type SessionMode = 'A' | 'B' | 'C'
export type Intensite = 'standard' | 'approfondi'

export interface JurySession {
  id: string
  user_id: string
  mode: SessionMode
  titre_tfe: string
  filiere: string
  niveau: string | null
  tfe_texte: string
  tfe_resume: TfeResume | null
  duree_cible_min: number
  intensite: Intensite
  label_eleve: string | null
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export interface JuryQuestion {
  id: string
  user_id: string
  ecole: string | null
  matiere: string | null
  niveau: string | null
  intitule: string
  type: QuestionType
  created_at: string
}

export interface JuryReport {
  id: string
  session_id: string
  user_id: string
  rapport_json: ReportJson
  label_eleve: string | null
  share_token: string
  created_at: string
}

export interface TfeResume {
  titre: string
  filiere: string
  resume: string
  points_cles: string[]
  citations_notables: string[]
}

export interface Exchange {
  question: string
  question_type: QuestionType
  reponse: string
  hesitation_sec: number
  annotation?: string
  timestamp: string
}

export interface DimensionResult {
  signal: 'alerte' | 'partiel' | 'ok'
  observations: string[]
}

export interface ReportJson {
  titre_tfe: string
  label_eleve: string
  date: string
  duree_reelle_min: number
  nb_questions: number
  paternite: DimensionResult
  comprehension: DimensionResult
  maitrise: DimensionResult
  pieges: DimensionResult
  extraits: Exchange[]
  observations_globales: string
}
