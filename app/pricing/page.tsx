'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CheckCircle2, Sparkles } from 'lucide-react'
import SiteHeader from '@/components/site/SiteHeader'
import SiteFooter from '@/components/site/SiteFooter'
import { Container, Section, CTAButton } from '@/components/ui/primitives'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for testing and small projects',
      price: 19,
      credits: 50,
      overage: 0.50,
      features: [
        '50 generation credits/month',
        'All 4 modes (Main, Lifestyle, Feature, Packaging)',
        '$0.50 per additional credit',
        '1080p resolution',
        'Email support',
        'Basic analytics',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Pro',
      description: 'For growing Amazon sellers',
      price: 49,
      credits: 200,
      overage: 0.35,
      features: [
        '200 generation credits/month',
        'All 4 modes',
        '$0.35 per additional credit',
        '4K resolution',
        'Priority support',
        'Advanced analytics',
        'API access',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Brand',
      description: 'For established brands and catalogs',
      price: 99,
      credits: 500,
      overage: 0.25,
      features: [
        '500 generation credits/month',
        'All 4 modes',
        '$0.25 per additional credit',
        '4K resolution',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Custom templates',
        'Batch processing',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Agency',
      description: 'For agencies managing multiple clients',
      price: 249,
      credits: 2000,
      overage: 0.20,
      features: [
        '2,000 generation credits/month',
        'All 4 modes',
        '$0.20 per additional credit',
        '4K+ resolution',
        'Dedicated account manager',
        'White-label options',
        'Advanced API access',
        'Custom integrations',
        'Team collaboration tools',
        'SLA guarantee',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large-scale operations',
      price: null,
      credits: null,
      overage: null,
      features: [
        'Unlimited generations',
        'All 4 modes',
        'Custom per-credit pricing',
        '4K+ resolution',
        'Dedicated account manager',
        'White-label & custom branding',
        'Custom integrations & workflows',
        'Team collaboration suite',
        'SLA guarantee',
        'Custom contract terms',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <Section size="lg">
        <Container size="lg">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              Simple, Transparent Pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Choose the Plan That Fits Your Needs
            </h1>
            <p className="text-xl text-muted-foreground">
              Start free. Scale as you grow. All plans include a 14-day free trial.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
                billingCycle === 'annual'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              disabled
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                Soon
              </span>
            </button>
          </div>
        </Container>
      </Section>

      {/* Pricing Cards */}
      <Section>
        <Container size="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.popular
                    ? 'border-2 border-primary shadow-lg'
                    : 'border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-4">
                    {plan.price !== null ? (
                      <>
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold">Custom</span>
                    )}
                  </div>
                  {plan.credits !== null && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.credits} credits included
                    </p>
                  )}
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <Link href={plan.cta === 'Contact Sales' ? '/contact' : '/auth?tab=signup'} className="mb-4">
                    {plan.popular ? (
                      <Button className="w-full">{plan.cta}</Button>
                    ) : (
                      <Button variant="outline" className="w-full">{plan.cta}</Button>
                    )}
                  </Link>

                  <ul className="space-y-2.5 text-sm flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Credit Cost Comparison */}
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Credit Comparison</CardTitle>
                <CardDescription>Cost per generation when you run out of monthly credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Starter</p>
                    <p className="text-2xl font-bold text-primary">$0.50</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pro</p>
                    <p className="text-2xl font-bold text-primary">$0.35</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Brand</p>
                    <p className="text-2xl font-bold text-primary">$0.25</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Agency</p>
                    <p className="text-2xl font-bold text-primary">$0.20</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Enterprise</p>
                    <p className="text-2xl font-bold text-primary">Custom</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section background="warm">
        <Container size="lg">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about CommercePix pricing
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  What counts as a generation credit?
                </AccordionTrigger>
                <AccordionContent>
                  One generation credit equals one AI-created image. Each mode (Main, Lifestyle, Feature, Packaging) uses one credit per image generated. For example, generating 5 main images and 3 lifestyle images would use 8 credits total.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  What happens if I run out of credits?
                </AccordionTrigger>
                <AccordionContent>
                  You can purchase additional credits at your plan's overage rate, or upgrade to a higher tier for a better per-credit price. Overage charges are billed automatically at the end of your billing cycle. You'll receive notifications when you're approaching your credit limit.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Do unused credits roll over to the next month?
                </AccordionTrigger>
                <AccordionContent>
                  No, credits reset at the start of each billing cycle. We recommend starting with a lower tier and upgrading as needed. You can monitor your usage in real-time through your dashboard.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Can I upgrade or downgrade my plan anytime?
                </AccordionTrigger>
                <AccordionContent>
                  Yes! You can change your plan at any time from your account settings. Upgrades take effect immediately and you'll be prorated for the current billing period. Downgrades take effect at the start of your next billing cycle.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  Is there a free trial?
                </AccordionTrigger>
                <AccordionContent>
                  Yes! All paid plans come with a 14-day free trial with full access to all features. No credit card required to start. You won't be charged until your trial ends, and you can cancel anytime.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  Are images Amazon compliant?
                </AccordionTrigger>
                <AccordionContent>
                  Absolutely. CommercePix is specifically designed for Amazon sellers. All generation modes are optimized to meet Amazon's image requirements, including white backgrounds for main images, appropriate sizing, and quality standards. However, you should always review images before uploading to ensure they meet your specific category requirements.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">
                  What payment methods do you accept?
                </AccordionTrigger>
                <AccordionContent>
                  We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor. Enterprise plans can be invoiced with NET-30 payment terms.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left">
                  Do you offer refunds?
                </AccordionTrigger>
                <AccordionContent>
                  Yes. If you're not satisfied within the first 14 days, we offer a full refund, no questions asked. After the trial period, we evaluate refund requests on a case-by-case basis. Contact our support team to discuss your situation.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section background="gradient">
        <Container size="md">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Create Professional Product Images?
            </h2>
            <p className="text-xl text-charcoal">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth?tab=signup">
                <CTAButton showArrow>Start Free Trial</CTAButton>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Sales
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              Questions? <Link href="/contact" className="text-primary hover:underline">Contact our team</Link> or check our <Link href="/app/help" className="text-primary hover:underline">help center</Link>.
            </p>
          </div>
        </Container>
      </Section>

      <SiteFooter />
    </div>
  )
}
