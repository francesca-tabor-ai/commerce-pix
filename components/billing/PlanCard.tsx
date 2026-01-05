'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { Plan } from '@/lib/db/billing-types'

interface PlanCardProps {
  plan: Plan
  currentPlanId: string | null
  userId: string
}

export function PlanCard({ plan, currentPlanId, userId }: PlanCardProps) {
  const [loading, setLoading] = useState(false)
  const isCurrent = plan.id === currentPlanId
  
  // Determine if this is an upgrade or downgrade
  const planOrder = ['starter', 'pro', 'brand', 'agency']
  const currentIndex = currentPlanId ? planOrder.indexOf(currentPlanId) : -1
  const thisIndex = planOrder.indexOf(plan.id)
  const isUpgrade = thisIndex > currentIndex
  const isDowngrade = thisIndex < currentIndex && currentIndex !== -1

  const handleSelectPlan = async () => {
    setLoading(true)
    
    try {
      // TODO: Implement Stripe checkout or plan change logic
      toast.info('Coming soon', {
        description: 'Plan changes will be available once payment processing is integrated'
      })
    } catch (error) {
      toast.error('Failed to change plan', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={`relative flex flex-col ${isCurrent ? 'border-primary border-2' : ''}`}>
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">
            ${(plan.monthly_price_cents / 100).toFixed(0)}
          </span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {plan.monthly_credits} credits/month
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-2 text-sm flex-1 mb-4">
          {(plan.features as string[]).slice(0, 4).map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className="w-full"
          variant={isCurrent ? 'outline' : isUpgrade ? 'default' : 'secondary'}
          disabled={isCurrent || loading}
          onClick={handleSelectPlan}
        >
          {isCurrent && 'Current Plan'}
          {!isCurrent && isUpgrade && (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade
            </>
          )}
          {!isCurrent && isDowngrade && 'Downgrade'}
          {!isCurrent && !isUpgrade && !isDowngrade && 'Select Plan'}
        </Button>

        {!isCurrent && plan.overage_cents > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            ${(plan.overage_cents / 100).toFixed(2)} per extra credit
          </p>
        )}
      </CardContent>
    </Card>
  )
}

