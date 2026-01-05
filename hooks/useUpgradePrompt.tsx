'use client'

import { useState, useCallback, useEffect } from 'react'
import { UpgradeModal } from '@/components/billing/UpgradeModal'

export type UpgradeReason =
  | 'no_credits'
  | 'trial_ended'
  | 'feature_locked'
  | 'plan_canceled'
  | 'rate_limit_exceeded'

interface UpgradePromptState {
  isOpen: boolean
  reason: UpgradeReason
  resetTime?: string | null
}

export function useUpgradePrompt() {
  const [state, setState] = useState<UpgradePromptState>({
    isOpen: false,
    reason: 'no_credits',
    resetTime: null,
  })

  const showUpgrade = useCallback(
    (reason: UpgradeReason, resetTime?: string | null) => {
      setState({
        isOpen: true,
        reason,
        resetTime,
      })
    },
    []
  )

  const hideUpgrade = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }, [])

  const UpgradePrompt = useCallback(() => {
    return (
      <UpgradeModal
        open={state.isOpen}
        onOpenChange={hideUpgrade}
        reason={state.reason}
        resetTime={state.resetTime}
      />
    )
  }, [state.isOpen, state.reason, state.resetTime, hideUpgrade])

  return {
    showUpgrade,
    hideUpgrade,
    UpgradePrompt,
    isOpen: state.isOpen,
    reason: state.reason,
  }
}

/**
 * Hook to check if upgrade should be shown based on error response
 */
export function useUpgradeFromError() {
  const { showUpgrade } = useUpgradePrompt()

  const checkError = useCallback(
    (error: any) => {
      // Check for API error responses
      if (error?.code === 'NO_CREDITS' || error?.error === 'Insufficient credits') {
        showUpgrade('no_credits')
        return true
      }

      if (error?.code === 'UPGRADE_REQUIRED' && error?.rateLimit?.upgradeRequired) {
        showUpgrade('rate_limit_exceeded', error.rateLimit?.resetAt)
        return true
      }

      if (error?.code === 'PLAN_CANCELED' || error?.message?.includes('canceled')) {
        showUpgrade('plan_canceled')
        return true
      }

      if (error?.code === 'TRIAL_ENDED' || error?.message?.includes('trial')) {
        showUpgrade('trial_ended')
        return true
      }

      return false
    },
    [showUpgrade]
  )

  return checkError
}

