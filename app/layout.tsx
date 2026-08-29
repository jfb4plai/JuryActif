import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HeaderAuthAction } from '@/components/HeaderAuthAction'
import './globals.css'

export const metadata: Metadata = {
  title: 'JuryActif — PLAI',
  description: 'Simulation de défense orale de TFE pour enseignants FWB',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="fr">
      <body className="bg-jfb-subtil min-h-screen">
        <header className="bg-white border-b border-jfb-bordure px-6 py-3 flex items-center justify-between">
          <Link href="/">
            <Image src="/plai-logo.jpg" alt="PLAI" width={160} height={64} className="object-contain" priority />
          </Link>
          <div className="flex items-center gap-4">
            <HeaderAuthAction signedIn={!!user} />
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
