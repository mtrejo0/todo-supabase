import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/todos')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Todo App
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
          Organize your tasks with folders, custom states, and scheduling
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
