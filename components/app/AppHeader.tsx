import SignOutButton from '@/components/SignOutButton'
import { User } from '@supabase/supabase-js'
import { getCreditBalance } from '@/lib/db/billing'
import { isUserOnTrial, getTrialDaysRemaining } from '@/lib/db/trial'
import { TrialBanner } from './TrialBanner'

interface AppHeaderProps {
  user: User
}

export default async function AppHeader({ user }: AppHeaderProps) {
  // Fetch credit balance and trial info in parallel
  const [creditBalance, onTrial, trialDays] = await Promise.all([
    getCreditBalance(user.id),
    isUserOnTrial(user.id),
    getTrialDaysRemaining(user.id)
  ])

  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-40 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <TrialBanner 
            isOnTrial={onTrial}
            creditBalance={creditBalance}
            trialDaysRemaining={trialDays}
          />
          <div className="text-sm text-muted-foreground">
            {user.email}
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}

