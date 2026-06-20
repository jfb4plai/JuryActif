// Pure helper — separated from route.ts so Next.js doesn't complain about
// non-HTTP exports in route files, while still being importable for tests.
import type { Exchange } from '@/lib/supabase/types'

export function buildReportPrompt(titreTfe: string, history: Exchange[]): string {
  const transcript = history.map(e =>
    `[${e.question_type}] Jury: ${e.question}\nÉlève (${e.hesitation_sec}s de réflexion): ${e.reponse}`
  ).join('\n\n')

  return `Tu analyses la défense orale d'un TFE CESS intitulé "${titreTfe}".

Transcription complète :
<transcription>
${transcript}
</transcription>

Génère un rapport d'accompagnement JSON avec cette structure exacte :
{
  "paternite": {
    "signal": "alerte" | "partiel" | "ok",
    "observations": ["observation factuelle 1", "observation factuelle 2"]
  },
  "comprehension": {
    "signal": "alerte" | "partiel" | "ok",
    "observations": ["..."]
  },
  "maitrise": {
    "signal": "alerte" | "partiel" | "ok",
    "observations": ["..."]
  },
  "pieges": {
    "signal": "alerte" | "partiel" | "ok",
    "observations": ["..."]
  },
  "extraits": [
    {
      "question": "question exacte du jury",
      "question_type": "paternite",
      "reponse": "réponse exacte de l'élève",
      "hesitation_sec": 12,
      "timestamp": ""
    }
  ],
  "observations_globales": "Paragraphe bienveillant et factuel pour l'accompagnant PAR/intégration. Signaux à investiguer en entretien, jamais d'accusation directe."
}

Règles :
- "signal" = "alerte" si comportement préoccupant, "partiel" si ambigu, "ok" si satisfaisant
- Les observations sont factuelles, sans jugement moral (le rapport est pour un accompagnant, pas un jury officiel)
- Les extraits : sélectionne les 3-5 échanges les plus significatifs
- Le texte est destiné à un accompagnant PAR ou d'intégration
- Réponds UNIQUEMENT avec le JSON`
}
