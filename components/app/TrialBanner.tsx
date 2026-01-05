'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TrialBannerProps {
  isOnTrial: boolean
  creditBalance: number
  trialDaysRemaining?: number | null
}

export function TrialBanner({ isOnTrial, creditBalance, trialDaysRemaining }: TrialBannerProps) {
  const router = useRouter()

  if (!isOnTrial) {
    // Show credit count for paid users
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{creditBalance}</span>
          <span className="text-sm text-muted-foreground">credits</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {/* Trial Badge */}
      <Badge variant="secondary" className="flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        Trial {trialDaysRemaining !== null && `(${trialDaysRemaining}d left)`}
      </Badge>

      {/* Credits Display */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
        <Zap className={`h-4 w-4 ${creditBalance === 0 ? 'text-destructive' : 'text-primary'}`} />
        <span className={`text-sm font-semibold ${creditBalance === 0 ? 'text-destructive' : ''}`}>
          {creditBalance}
        </span>
        <span className="text-sm text-muted-foreground">
          credit{creditBalance !== 1 ? 's' : ''} left
        </span>
      </div>

      {/* Upgrade Button */}
      {creditBalance <= 5 && (
        <Button
          size="sm"
          variant={creditBalance === 0 ? 'default' : 'outline'}
          onClick={() => router.push('/app/billing')}
        >
          <Sparkles className="mr-2 h-3 w-3" />
          Upgrade
        </Button>
      )}
    </div>
  )
}

