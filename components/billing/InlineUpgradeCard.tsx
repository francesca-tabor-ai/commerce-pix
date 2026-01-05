'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  Sparkles,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'

interface InlineUpgradeCardProps {
  reason: 'no_credits' | 'plan_canceled' | 'rate_limit_exceeded' | 'trial_ended'
  resetTime?: string | null
  className?: string
  compact?: boolean
}

const UPGRADE_MESSAGES = {
  no_credits: {
    title: 'Out of Credits',
    description: 'You\'ve used all your credits. Upgrade to continue creating product images.',
    icon: Zap,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  plan_canceled: {
    title: 'Plan Canceled',
    description: 'Your subscription has been canceled. Reactivate to continue.',
    icon: AlertTriangle,
    iconColor: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
  },
  rate_limit_exceeded: {
    title: 'Rate Limit Reached',
    description: 'Upgrade for unlimited daily generations.',
    icon: Clock,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  trial_ended: {
    title: 'Trial Ended',
    description: 'Your free trial has ended. Upgrade to continue.',
    icon: TrendingUp,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
}

const QUICK_FEATURES = [
  'Unlimited daily generations',
  'All 4 generation modes',
  'Priority support',
  'Advanced analytics',
]

export function InlineUpgradeCard({
  reason,
  resetTime,
  className = '',
  compact = false,
}: InlineUpgradeCardProps) {
  const config = UPGRADE_MESSAGES[reason]
  const Icon = config.icon

  if (compact) {
    return (
      <Card className={`${config.borderColor} ${config.bgColor} ${className}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{config.title}</p>
                <p className="text-xs text-muted-foreground">
                  {reason === 'rate_limit_exceeded' && resetTime
                    ? `Wait until ${new Date(resetTime).toLocaleTimeString()} or upgrade`
                    : config.description}
                </p>
              </div>
            </div>
            <Link href="/app/billing">
              <Button size="sm">
                <Sparkles className="mr-2 h-3 w-3" />
                Upgrade
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${config.borderColor} ${config.bgColor} ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`h-8 w-8 ${config.iconColor}`} />
        </div>
        <CardTitle className="text-2xl">{config.title}</CardTitle>
        <CardDescription className="text-base">
          {reason === 'rate_limit_exceeded' && resetTime
            ? `You've reached your generation limit. Upgrade for unlimited daily generations or wait until ${new Date(resetTime).toLocaleTimeString()}.`
            : config.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recommended Plan */}
        <div className="bg-background rounded-lg border border-primary/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-lg">Pro Plan</h4>
                <Badge variant="secondary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Perfect for growing sellers</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">$49</div>
              <div className="text-xs text-muted-foreground">/month</div>
            </div>
          </div>

          <p className="text-sm font-semibold text-primary mb-3">200 credits/month</p>

          <ul className="space-y-2 text-sm mb-4">
            {QUICK_FEATURES.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link href="/app/billing" className="block">
            <Button className="w-full" size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>

        {/* View All Plans Link */}
        <div className="text-center">
          <Link href="/app/billing">
            <Button variant="outline" className="w-full">
              View All Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">
            14-day money-back guarantee • Cancel anytime
          </p>
        </div>

        {/* Reset Time Info (for rate limits) */}
        {reason === 'rate_limit_exceeded' && resetTime && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Your limit resets at{' '}
                <strong className="text-foreground">
                  {new Date(resetTime).toLocaleTimeString()}
                </strong>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

