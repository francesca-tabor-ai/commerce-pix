import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Zap, Shield, TrendingUp, Package, Image as ImageIcon, Sparkles } from 'lucide-react'
import SiteHeader from '@/components/site/SiteHeader'
import SiteFooter from '@/components/site/SiteFooter'
import { Container, Section, CTAButton } from '@/components/ui/primitives'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <Section size="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <Container size="lg" className="relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              Built for Amazon Sellers
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Create High-Converting Amazon Product Images — Without a Photoshoot
            </h1>
            <p className="text-xl md:text-2xl text-charcoal leading-relaxed">
              CommercePix helps Amazon sellers generate compliant, professional product images in minutes using AI — not agencies, studios, or Photoshop.
            </p>
            <p className="text-lg text-graphite">
              Upload a product photo. Choose what you need. Get listing-ready images designed to convert.
            </p>
            <div className="pt-4">
              <Link href="/auth?tab=signup">
                <CTAButton showArrow>Start Free Trial</CTAButton>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              No credit card required • Free to start • Amazon compliance built-in
            </p>
          </div>
        </Container>
      </Section>

      {/* Social Proof Strip */}
      <Section size="sm" background="warm">
        <Container size="xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary mb-1">Fast</div>
              <p className="text-sm text-muted-foreground">Minutes, not weeks</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">Compliant</div>
              <p className="text-sm text-muted-foreground">Amazon-safe by design</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">Consistent</div>
              <p className="text-sm text-muted-foreground">Professional quality</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">Scalable</div>
              <p className="text-sm text-muted-foreground">Perfect for growth</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* What You Can Create */}
      <Section id="features">
        <Container size="xl">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Can Create</h2>
              <p className="text-xl text-muted-foreground">
                Four powerful modes for every Amazon listing need
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass hover:shadow-soft-lg transition-all duration-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                    <ImageIcon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Main Listing Images</h3>
                  <p className="text-sm text-muted-foreground">
                    Clean, compliant hero images with pure white backgrounds. Optimized for Amazon search results and designed to convert browsers into buyers.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass hover:shadow-soft-lg transition-all duration-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                    <Package className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Lifestyle Images</h3>
                  <p className="text-sm text-muted-foreground">
                    Place your product in realistic, high-converting usage scenes. Show context and emotional connection without expensive photoshoots.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass hover:shadow-soft-lg transition-all duration-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Feature & Callout Images</h3>
                  <p className="text-sm text-muted-foreground">
                    Highlight benefits, details, and differentiators clearly. Perfect for A+ content and secondary listing images that drive conversions.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass hover:shadow-soft-lg transition-all duration-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Packaging & In-Box Visuals</h3>
                  <p className="text-sm text-muted-foreground">
                    Show what customers receive — accurately and professionally. Build trust with transparent, high-quality packaging presentations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* How It Works */}
      <Section background="warm" id="how-it-works">
        <Container size="lg">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground">Three simple steps to professional product images</p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    1
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-semibold mb-2">Upload Your Product Photo</h3>
                  <p className="text-muted-foreground">
                    Start with a simple product image — no studio required. Any angle, any lighting condition. Our AI handles the rest.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    2
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-semibold mb-2">Choose a Mode</h3>
                  <p className="text-muted-foreground mb-4">
                    Select exactly what you want to create:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Main image (white background)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Lifestyle scene
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Feature visual
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Packaging preview
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    3
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-semibold mb-2">Generate & Download</h3>
                  <p className="text-muted-foreground mb-4">
                    Get high-resolution images ready for Amazon listings, A+ content, and storefronts in minutes.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">✓ No prompt writing</p>
                    <p className="text-sm font-medium">✓ No editing skills required</p>
                    <p className="text-sm font-medium">✓ Production-ready quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Why CommercePix */}
      <Section>
        <Container size="lg">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Sellers Choose CommercePix</h2>
              <p className="text-lg text-muted-foreground">
                Built specifically for Amazon, designed for results
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Amazon-Safe by Design</h4>
                  <p className="text-sm text-muted-foreground">
                    Prompts and outputs are optimized for Amazon compliance. No more rejected listings.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Fast Iteration</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate multiple variations in minutes, not weeks. Test and optimize rapidly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Consistent Quality</h4>
                  <p className="text-sm text-muted-foreground">
                    Reusable workflows ensure every SKU looks professional and on-brand.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Lower Costs</h4>
                  <p className="text-sm text-muted-foreground">
                    Replace expensive photoshoots with scalable AI image generation. ROI from day one.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Built for Scale</h4>
                  <p className="text-sm text-muted-foreground">
                    Perfect for brands, agencies, and growing catalogs with hundreds of SKUs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Real-Time Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Track costs, usage, and performance with built-in insights and reporting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Final CTA Section */}
      <Section background="gradient">
        <Container size="md">
          <div className="text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to Transform Your Listings?</h2>
            <p className="text-xl text-charcoal">
              Join thousands of Amazon sellers creating professional product images in minutes.
            </p>
            <div className="space-y-4">
              <p className="text-lg font-medium text-graphite">
                No photoshoot. No design software. No guesswork.
              </p>
              <Link href="/auth?tab=signup">
                <CTAButton showArrow>Start Free Trial</CTAButton>
              </Link>
            </div>
            <div className="pt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <SiteFooter />
    </div>
  )
}
