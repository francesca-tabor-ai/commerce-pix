import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabase/server'
import { getPlan } from '@/lib/db/billing'

export const dynamic = 'force-dynamic'

/**
 * POST /api/billing/checkout
 * 
 * Initiates checkout for a subscription plan
 * 
 * MVP: Returns "Not configured" message
 * Production: Creates Stripe checkout session and returns URL
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireUser()

    // Parse request body
    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Validate plan exists
    const plan = await getPlan(planId)

    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 404 }
      )
    }

    // =====================================================
    // MVP: Return "Not configured" placeholder
    // =====================================================
    // In production, this would:
    // 1. Create Stripe checkout session
    // 2. Return checkout URL
    // 3. Redirect user to Stripe
    //
    // Example production code:
    // 
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const session = await stripe.checkout.sessions.create({
    //   customer_email: user.email,
    //   line_items: [{
    //     price: plan.stripe_price_id,
    //     quantity: 1,
    //   }],
    //   mode: 'subscription',
    //   success_url: `${process.env.NEXT_PUBLIC_URL}/app/billing?success=true`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_URL}/app/billing?canceled=true`,
    //   metadata: {
    //     user_id: user.id,
    //     plan_id: planId,
    //   },
    // })
    //
    // return NextResponse.json({ url: session.url })
    // =====================================================

    return NextResponse.json({
      success: false,
      message: 'Payment processing is not yet configured. Stripe integration coming soon!',
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.monthly_price_cents / 100,
      },
      // In production, this would be the Stripe checkout URL
      url: null,
    })

  } catch (error) {
    console.error('Checkout error:', error)

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('not authenticated')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to process checkout',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/billing/checkout
 * 
 * Returns checkout configuration info (for debugging)
 */
export async function GET() {
  return NextResponse.json({
    configured: false,
    message: 'Stripe checkout not configured',
    documentation: 'Add STRIPE_SECRET_KEY to enable payment processing'
  })
}

