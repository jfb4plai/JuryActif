'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function HeaderAuthAction({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname()

  if (signedIn) {
    return (
      <form action="/auth/signout" method="post">
        <button type="submit" className="text-xs text-jfb-gris hover:text-jfb-noir">Déconnexion</button>
      </form>
    )
  }

  // Pas de bouton "Connexion" redondant quand on est déjà sur l'écran de connexion.
  if (pathname.startsWith('/auth/login')) return null

  return (
    <Link href="/auth/login" className="text-xs font-semibold text-white px-3 py-1.5 bg-jfb-noir rounded">
      Connexion
    </Link>
  )
}
