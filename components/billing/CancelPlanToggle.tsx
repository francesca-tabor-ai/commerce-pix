'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { toggleCancelSubscription } from '@/app/actions/billing'

interface CancelPlanToggleProps {
  subscriptionId: string
  cancelAtPeriodEnd: boolean
  periodEnd: string
}

export function CancelPlanToggle({ 
  subscriptionId, 
  cancelAtPeriodEnd, 
  periodEnd 
}: CancelPlanToggleProps) {
  const [loading, setLoading] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleToggleCancel = async () => {
    setLoading(true)

    try {
      const result = await toggleCancelSubscription(subscriptionId, !cancelAtPeriodEnd)

      if (result.success) {
        if (cancelAtPeriodEnd) {
          toast.success('Subscription reactivated', {
            description: 'Your subscription will continue as normal'
          })
        } else {
          toast.info('Subscription will cancel', {
            description: `Access until ${formatDate(periodEnd)}`
          })
        }
      } else {
        toast.error('Failed to update subscription', {
          description: result.error || 'Please try again'
        })
      }
    } catch (error) {
      toast.error('Unexpected error', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Subscription Management
        </h4>
        <p className="text-sm text-muted-foreground">
          {cancelAtPeriodEnd 
            ? 'Your subscription is scheduled to cancel. Click below to reactivate.'
            : 'Cancel your subscription at the end of the current billing period.'
          }
        </p>
      </div>

      <Button
        variant={cancelAtPeriodEnd ? 'default' : 'destructive'}
        onClick={handleToggleCancel}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {cancelAtPeriodEnd ? 'Reactivate Subscription' : 'Cancel Subscription'}
      </Button>

      {!cancelAtPeriodEnd && (
        <p className="text-xs text-muted-foreground">
          You'll retain access until {formatDate(periodEnd)}
        </p>
      )}
    </div>
  )
}

