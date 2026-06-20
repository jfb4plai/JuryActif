// Pure helper — separated from route.ts so Next.js doesn't complain about
// non-HTTP exports in route files, while still being importable for tests.
export function buildAnalyzePrompt(titre: string, filiere: string, texte: string): string {
  return `Tu analyses le travail de fin d'études (TFE) d'un élève de CESS (secondaire supérieur FWB).

Titre : ${titre}
Filière : ${filiere}

Texte du TFE (extrait ou complet) :
<tfe>
${texte}
</tfe>

Retourne un JSON strict avec cette structure :
{
  "titre": ${JSON.stringify(titre)},
  "filiere": ${JSON.stringify(filiere)},
  "resume": "résumé factuel du TFE en 3-4 phrases",
  "points_cles": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "citations_notables": ["citation exacte du texte 1", "citation exacte du texte 2", "citation exacte du texte 3"]
}

Règles :
- Les citations_notables sont des extraits EXACTS du texte fourni, utiles pour tester la paternité
- Les points_cles sont les idées centrales que l'élève doit pouvoir expliquer
- Réponds UNIQUEMENT avec le JSON, sans aucun texte avant ou après`
}
