import { createClient } from '@/lib/supabase/server'
import QuestionBank from '@/components/QuestionBank'
import Link from 'next/link'

export default async function QuestionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: questions } = await supabase
    .from('jury_questions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-jfb-noir">Mes questions personnalisées</h1>
        <Link href="/" className="text-sm text-gray-500 hover:text-jfb-noir">← Accueil</Link>
      </div>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Ces questions constituent vos 20% de singularité enseignant. Elles sont injectées naturellement dans le flux de questions IA — jamais posées en bloc.
      </p>
      <QuestionBank initial={questions ?? []} />
    </main>
  )
}
