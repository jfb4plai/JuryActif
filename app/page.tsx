import ModeSelector from '@/components/ModeSelector'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-jfb-noir mb-3">JuryActif</h1>
        <p className="text-jfb-gris max-w-xl mx-auto">
          Simulation de défense orale de TFE — prépare-toi face à un jury IA qui a lu ton travail.
        </p>
      </div>
      <ModeSelector />
      <p className="text-center text-xs text-jfb-gris-cl mt-10">
        <Link href="/questions" className="underline">Gérer ma banque de questions</Link>
      </p>
    </main>
  )
}
