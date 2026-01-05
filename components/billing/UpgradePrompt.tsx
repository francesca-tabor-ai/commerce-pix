'use client'

import { useEffect } from 'react'
import { InlineUpgradeCard } from './InlineUpgradeCard'
import type { UpgradeReason } from '@/hooks/useUpgradePrompt'

interface UpgradePromptProps {
  credits: number
  planStatus: string | null
  showUpgrade?: (reason: UpgradeReason) => void
  inline?: boolean
  className?: string
}

/**
 * Smart component that automatically shows upgrade prompts based on user state
 */
export function UpgradePrompt({
  credits,
  planStatus,
  showUpgrade,
  inline = false,
  className = '',
}: UpgradePromptProps) {
  // Determine if upgrade should be shown
  const shouldShowUpgrade =
    credits === 0 ||
    planStatus === 'canceled' ||
    planStatus === 'past_due' ||
    planStatus === null

  // Determine the reason
  const getReason = (): UpgradeReason => {
    if (credits === 0) return 'no_credits'
    if (planStatus === 'canceled') return 'plan_canceled'
    if (planStatus === null || planStatus === 'trialing') return 'trial_ended'
    return 'no_credits'
  }

  const reason = getReason()

  // Auto-show modal on mount if needed (and callback provided)
  useEffect(() => {
    if (shouldShowUpgrade && showUpgrade && !inline) {
      showUpgrade(reason)
    }
  }, [shouldShowUpgrade, showUpgrade, reason, inline])

  // If inline mode, show the card
  if (inline && shouldShowUpgrade) {
    return <InlineUpgradeCard reason={reason} className={className} compact />
  }

  // Otherwise, don't render anything (modal is handled by the hook)
  return null
}

