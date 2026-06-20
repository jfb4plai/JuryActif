'use client'
import { useRouter } from 'next/navigation'

export default function ModeSelector() {
  const router = useRouter()

  const modes = [
    {
      id: 'A' as const,
      label: 'Élève seul',
      desc: 'Tu passes ta défense seul·e. Le rapport sera partageable avec ton accompagnant PAR ou d\'intégration.',
      color: 'border-plai-teal',
      badge: 'bg-plai-teal',
    },
    {
      id: 'B' as const,
      label: 'Enseignant + élève',
      desc: 'L\'enseignant configure la session et peut intervenir pendant la défense (injecter une question, annoter une réponse).',
      color: 'border-plai-orange',
      badge: 'bg-plai-orange',
    },
    {
      id: 'C' as const,
      label: 'Enseignant seul',
      desc: 'Génère une banque de questions stratégiques à partir du TFE, à poser toi-même lors du vrai jury.',
      color: 'border-jfb-noir',
      badge: 'bg-jfb-noir',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {modes.map(m => (
        <button
          key={m.id}
          type="button"
          onClick={() => router.push(`/session/new?mode=${m.id}`)}
          className={`text-left border-2 ${m.color} rounded-xl p-6 hover:shadow-md transition-shadow bg-white`}
        >
          <span className={`text-xs text-white font-bold px-2 py-0.5 rounded ${m.badge} mb-3 inline-block`}>
            MODE {m.id}
          </span>
          <h2 className="font-bold text-jfb-noir text-lg mb-2">{m.label}</h2>
          <p className="text-jfb-gris text-sm leading-relaxed">{m.desc}</p>
        </button>
      ))}
    </div>
  )
}
