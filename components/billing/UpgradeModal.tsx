'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Sparkles, Zap, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason?: 'no_credits' | 'trial_ended' | 'feature_locked'
}

const FEATURED_PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    credits: 200,
    features: [
      '200 credits/month',
      'All 4 modes',
      '4K resolution',
      'Priority support',
      'Advanced analytics',
    ],
    popular: true,
  },
  {
    id: 'brand',
    name: 'Brand',
    price: 99,
    credits: 500,
    features: [
      '500 credits/month',
      'All Pro features',
      'Dedicated onboarding',
      'Custom templates',
      'Team collaboration',
    ],
    popular: false,
  },
]

export function UpgradeModal({ open, onOpenChange, reason = 'no_credits' }: UpgradeModalProps) {
  const router = useRouter()

  const getMessage = () => {
    switch (reason) {
      case 'no_credits':
        return {
          title: 'Out of Credits',
          description: 'You\'ve used all your trial credits. Upgrade to continue creating amazing product images.',
          icon: <Zap className="h-12 w-12 text-amber-500 mx-auto mb-4" />,
        }
      case 'trial_ended':
        return {
          title: 'Trial Ended',
          description: 'Your free trial has ended. Upgrade to continue using CommercePix.',
          icon: <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />,
        }
      case 'feature_locked':
        return {
          title: 'Premium Feature',
          description: 'This feature is available on paid plans. Upgrade to unlock it.',
          icon: <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />,
        }
      default:
        return {
          title: 'Upgrade Your Plan',
          description: 'Get more credits and unlock premium features.',
          icon: <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />,
        }
    }
  }

  const message = getMessage()

  const handleViewPlans = () => {
    onOpenChange(false)
    router.push('/app/billing')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          {message.icon}
          <DialogTitle className="text-2xl">{message.title}</DialogTitle>
          <DialogDescription className="text-base">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {FEATURED_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.popular ? 'border-primary border-2 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-3">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>Perfect for growing sellers</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-primary font-semibold mt-2">
                  {plan.credits} credits/month
                </p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 text-sm flex-1 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'secondary'}
                  onClick={handleViewPlans}
                >
                  {plan.popular && <Sparkles className="mr-2 h-4 w-4" />}
                  Select {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center space-y-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleViewPlans}
          >
            View All Plans
          </Button>
          <p className="text-sm text-muted-foreground">
            14-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

