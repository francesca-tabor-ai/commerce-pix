import { requireUser } from '@/lib/supabase/server'
import { 
  getUserSubscription, 
  getPlans, 
  getCreditSummary,
  getUserPeriodUsage 
} from '@/lib/db/billing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/app/AppHeader'
import { CheckCircle2, CreditCard, AlertCircle, TrendingUp, Calendar, Sparkles } from 'lucide-react'
import { PlanCard } from '@/components/billing/PlanCard'
import { CancelPlanToggle } from '@/components/billing/CancelPlanToggle'
import { PlanSelectionModal } from '@/components/billing/PlanSelectionModal'

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const user = await requireUser()

  // Fetch all data in parallel
  const [subscription, allPlans, creditSummary, periodUsage] = await Promise.all([
    getUserSubscription(user.id),
    getPlans(),
    getCreditSummary(user.id),
    getUserPeriodUsage(user.id)
  ])

  const currentPlan = subscription 
    ? allPlans.find(p => p.id === subscription.plan_id)
    : null

  // Calculate percentage for progress bar
  const usagePercentage = creditSummary.monthly_allowance 
    ? Math.min((periodUsage / creditSummary.monthly_allowance) * 100, 100)
    : 0

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, label: string }> = {
      active: { variant: 'default', label: 'Active' },
      trialing: { variant: 'secondary', label: 'Trial' },
      past_due: { variant: 'destructive', label: 'Past Due' },
      canceled: { variant: 'outline', label: 'Canceled' }
    }
    const config = variants[status] || { variant: 'outline', label: status }
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  return (
    <>
      <AppHeader title="Billing & Subscription" />
      
      <div className="space-y-6">
        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </div>
              {subscription && getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {subscription && currentPlan ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-2xl font-bold">{currentPlan.name}</div>
                    <div className="text-muted-foreground">
                      ${(currentPlan.monthly_price_cents / 100).toFixed(2)} / month
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Renews {formatDate(subscription.current_period_end)}</span>
                      </div>
                    </div>
                  </div>
                  <PlanSelectionModal 
                    plans={allPlans} 
                    currentPlanId={subscription.plan_id}
                    trigger={
                      <Button variant="outline">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Change Plan
                      </Button>
                    }
                  />
                </div>

                {subscription.cancel_at_period_end && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-900 dark:text-amber-200">
                        Subscription will cancel on {formatDate(subscription.current_period_end)}
                      </p>
                      <p className="text-amber-700 dark:text-amber-300 mt-1">
                        You'll retain access until the end of your billing period
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Plan Includes:</h4>
                  <ul className="space-y-2">
                    {(currentPlan.features as string[]).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cancel Plan Toggle */}
                <div className="pt-4 border-t">
                  <CancelPlanToggle 
                    subscriptionId={subscription.id}
                    cancelAtPeriodEnd={subscription.cancel_at_period_end}
                    periodEnd={subscription.current_period_end || ''}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No active subscription</p>
                <p className="text-sm text-muted-foreground">
                  Choose a plan below to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit Balance & Usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Credit Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Credit Balance
              </CardTitle>
              <CardDescription>Your available generation credits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-bold">{creditSummary.balance}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    credits available
                  </div>
                </div>
                
                {creditSummary.monthly_allowance && (
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly allowance</span>
                      <span className="font-medium">{creditSummary.monthly_allowance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total earned</span>
                      <span className="font-medium text-green-600">{creditSummary.total_earned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total spent</span>
                      <span className="font-medium text-orange-600">{creditSummary.total_spent}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage This Month */}
          <Card>
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
              <CardDescription>Generations used this billing period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Generations</span>
                    <span className="font-medium">
                      {periodUsage} / {creditSummary.monthly_allowance || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300" 
                      style={{ width: `${usagePercentage}%` }} 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits remaining</span>
                    <span className="font-medium">{Math.max(0, creditSummary.balance)}</span>
                  </div>
                  {subscription?.current_period_end && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resets on</span>
                      <span className="font-medium">
                        {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Plans */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Available Plans</h2>
              <p className="text-muted-foreground mt-1">
                {subscription ? 'Upgrade or downgrade your plan' : 'Choose a plan to get started'}
              </p>
            </div>
            <PlanSelectionModal 
              plans={allPlans} 
              currentPlanId={subscription?.plan_id || null}
            />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allPlans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                currentPlanId={subscription?.plan_id || null}
                userId={user.id}
              />
            ))}
          </div>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>Your invoices and payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No billing history yet</p>
              <p className="text-sm text-muted-foreground">
                Invoices will appear here once you have an active subscription
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
