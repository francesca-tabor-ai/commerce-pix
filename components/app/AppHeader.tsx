import SignOutButton from '@/components/SignOutButton'
import { User } from '@supabase/supabase-js'

interface AppHeaderProps {
  user: User
}

export default function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-40 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {user.email}
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}

