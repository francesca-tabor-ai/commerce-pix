'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Loader2, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Plan } from '@/lib/db/billing-types'

interface PlanSelectionModalProps {
  plans: Plan[]
  currentPlanId: string | null
  trigger?: React.ReactNode
}

export function PlanSelectionModal({ plans, currentPlanId, trigger }: PlanSelectionModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const planOrder = ['starter', 'pro', 'brand', 'agency']
  const currentIndex = currentPlanId ? planOrder.indexOf(currentPlanId) : -1

  const getActionType = (planId: string) => {
    const thisIndex = planOrder.indexOf(planId)
    if (planId === currentPlanId) return 'current'
    if (thisIndex > currentIndex) return 'upgrade'
    if (thisIndex < currentIndex && currentIndex !== -1) return 'downgrade'
    return 'select'
  }

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlanId) return

    setSelectedPlanId(planId)
    setLoading(true)

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process checkout')
      }

      // In MVP, this returns "Not configured"
      // In production, this would redirect to Stripe
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        // Show "not configured" message
        toast.info('Payment processing not configured', {
          description: data.message || 'Stripe integration coming soon'
        })
        setOpen(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setLoading(false)
      setSelectedPlanId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Change Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
          <DialogDescription>
            Select a plan that fits your needs. You can change or cancel anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {plans.map((plan) => {
            const actionType = getActionType(plan.id)
            const isCurrent = actionType === 'current'
            const isSelected = selectedPlanId === plan.id
            const isProcessing = loading && isSelected

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col transition-all ${
                  isCurrent ? 'border-primary border-2' : ''
                } ${isSelected && !isCurrent ? 'ring-2 ring-primary' : ''}`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary">Current Plan</Badge>
                  </div>
                )}

                {actionType === 'upgrade' && (
                  <div className="absolute -top-3 right-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Upgrade
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {plan.id === 'starter' && 'Perfect for getting started'}
                    {plan.id === 'pro' && 'For growing businesses'}
                    {plan.id === 'brand' && 'For established brands'}
                    {plan.id === 'agency' && 'For agencies & teams'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col pb-4">
                  <div className="mb-4">
                    <div className="text-3xl font-bold">
                      ${(plan.monthly_price_cents / 100).toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>

                  <div className="mb-4 text-sm">
                    <div className="font-semibold mb-1">
                      {plan.monthly_credits.toLocaleString()} credits/month
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${(plan.overage_cents / 100).toFixed(2)} per extra credit
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-xs flex-1 mb-4">
                    {(plan.features as string[]).slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {(plan.features as string[]).length > 5 && (
                      <li className="text-muted-foreground pl-5">
                        +{(plan.features as string[]).length - 5} more features
                      </li>
                    )}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : actionType === 'upgrade' ? 'default' : 'secondary'}
                    disabled={isCurrent || loading}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : actionType === 'upgrade' ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Upgrade
                      </>
                    ) : actionType === 'downgrade' ? (
                      'Downgrade'
                    ) : (
                      'Select Plan'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            All plans include a 14-day free trial. Cancel anytime. No credit card required to start.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

