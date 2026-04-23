import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-4 sm:h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Todo App
            </h1>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 truncate flex-1 sm:flex-initial">
                {user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors whitespace-nowrap"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
