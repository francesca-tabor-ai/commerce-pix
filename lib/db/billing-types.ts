// =====================================================
// BILLING SYSTEM TYPES
// =====================================================
// TypeScript types for plans, subscriptions, credits

export interface Plan {
  id: 'starter' | 'pro' | 'brand' | 'agency'
  name: string
  monthly_price_cents: number
  monthly_credits: number
  overage_cents: number
  features: string[]
  created_at: string
  updated_at: string
}

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled'

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export type CreditReason = 
  | 'subscription_reset'
  | 'generation'
  | 'bonus'
  | 'admin_adjust'
  | 'overage_purchase'

export type CreditRefType = 'job' | 'subscription' | 'admin' | 'purchase' | null

export interface CreditLedgerEntry {
  id: string
  user_id: string
  delta: number // positive = add, negative = spend
  reason: CreditReason
  ref_type: CreditRefType
  ref_id: string | null
  created_at: string
}

export interface UsageCounter {
  user_id: string
  day: string // date string YYYY-MM-DD
  generations: number
  updated_at: string
}

// Helper type for creating subscriptions
export interface NewSubscription {
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  current_period_start?: string
  current_period_end?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

// Helper type for credit balance
export interface CreditBalance {
  balance: number
  subscription?: {
    plan: Plan
    monthly_credits: number
    period_start: string
    period_end: string
  }
}

