import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Zap, Shield, TrendingUp, Package, Image as ImageIcon, Sparkles, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">CommercePix</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              Built for Amazon Sellers
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-deep-slate">
              Create High-Converting Amazon Product Images — Without a Photoshoot
            </h1>
            <p className="text-xl md:text-2xl text-charcoal max-w-3xl mx-auto leading-relaxed">
              CommercePix helps Amazon sellers generate compliant, professional product images in minutes using AI — not agencies, studios, or Photoshop.
            </p>
            <p className="text-lg text-graphite max-w-2xl mx-auto">
              Upload a product photo. Choose what you need. Get listing-ready images designed to convert.
            </p>
            <div className="pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="h-14 px-8 text-base font-semibold shadow-gold">
                  Start Creating Product Images
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              No credit card required • Free to start • Amazon compliance built-in
            </p>
          </div>
        </div>
      </section>

      {/* Quick Value Props */}
      <section className="py-12 bg-warm-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">Main Images</div>
              <p className="text-sm text-muted-foreground">White background, compliant</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">Lifestyle Scenes</div>
              <p className="text-sm text-muted-foreground">Realistic usage contexts</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">Feature Visuals</div>
              <p className="text-sm text-muted-foreground">Highlight key benefits</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">A+ Content</div>
              <p className="text-sm text-muted-foreground">Done faster than ever</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">The Problem</h2>
              <p className="text-xl text-charcoal">
                Selling on Amazon requires great images.<br />
                Getting them is slow, expensive, and frustrating.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
              <Card className="border-2 border-border">
                <CardContent className="pt-6 space-y-3">
                  <div className="text-4xl">💸</div>
                  <h3 className="font-semibold">Expensive Photoshoots</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional shoots cost hundreds or thousands per SKU
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border">
                <CardContent className="pt-6 space-y-3">
                  <div className="text-4xl">⏰</div>
                  <h3 className="font-semibold">Slow Turnaround</h3>
                  <p className="text-sm text-muted-foreground">
                    Revisions take days or weeks to complete
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border">
                <CardContent className="pt-6 space-y-3">
                  <div className="text-4xl">🎲</div>
                  <h3 className="font-semibold">Unpredictable AI Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Generic AI is unreliable and often non-compliant
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-border">
                <CardContent className="pt-6 space-y-3">
                  <div className="text-4xl">📋</div>
                  <h3 className="font-semibold">Strict Amazon Rules</h3>
                  <p className="text-sm text-muted-foreground">
                    Image guidelines are complex and unforgiving
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center pt-8">
              <p className="text-lg text-charcoal">
                Most sellers don't need "creative freedom."<br />
                They need <strong>images that convert and get approved</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">The Solution</h2>
              <h3 className="text-2xl font-semibold text-primary">Built for Amazon. Designed for Speed.</h3>
              <p className="text-lg text-charcoal max-w-2xl mx-auto">
                CommercePix is an AI-powered image tool <strong>designed specifically for Amazon sellers</strong>.
              </p>
              <p className="text-base text-graphite max-w-2xl mx-auto">
                Instead of generic image generation, CommercePix uses <strong>controlled workflows</strong> to create images that meet marketplace standards and buyer expectations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">You select the outcome</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose exactly what type of image you need — no complex prompting required.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">CommercePix handles the rest</h4>
                  <p className="text-sm text-muted-foreground">
                    Automated compliance checks and optimized prompts ensure quality every time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Create */}
      <section className="py-20 md:py-32" id="features">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Can Create</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass hover:shadow-soft-lg transition-all duration-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                    <ImageIcon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Main Listing Images (White Background)</h3>
                  <p className="text-sm text-muted-foreground">
                    Clean, compliant hero images optimized for Amazon search results.
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
                    Place your product in realistic, high-converting usage scenes.
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
                    Highlight benefits, details, and differentiators clearly.
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
                    Show what customers receive — accurately and professionally.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-warm-white" id="how-it-works">
        <div className="container mx-auto px-6">
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
                    Start with a simple product image — no studio required.
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
                      Main image
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
                    Get high-resolution images ready for Amazon listings, A+ content, and storefronts.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">No prompt writing.</p>
                    <p className="text-sm font-medium">No editing skills required.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose CommercePix */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Sellers Choose CommercePix</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Amazon-Safe by Design</h4>
                  <p className="text-sm text-muted-foreground">
                    Prompts and outputs are optimized for Amazon compliance.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Fast Iteration</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate multiple variations in minutes, not weeks.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Consistent Quality</h4>
                  <p className="text-sm text-muted-foreground">
                    Reusable workflows ensure every SKU looks professional.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Lower Costs</h4>
                  <p className="text-sm text-muted-foreground">
                    Replace photoshoots with scalable AI image generation.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Built for Scale</h4>
                  <p className="text-sm text-muted-foreground">
                    Perfect for brands, agencies, and growing catalogs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Real-Time Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Track costs, usage, and performance with built-in insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Who It's For</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Amazon Sellers</h4>
                  <p className="text-sm text-muted-foreground">
                    Launching new products and need compliant images fast
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">E-commerce Brands</h4>
                  <p className="text-sm text-muted-foreground">
                    Managing multiple SKUs and need consistent quality
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Marketing Agencies</h4>
                  <p className="text-sm text-muted-foreground">
                    Producing listing assets at scale for multiple clients
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">DTC Sellers</h4>
                  <p className="text-sm text-muted-foreground">
                    Expanding into marketplaces and need professional visuals
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center pt-8">
              <p className="text-lg text-charcoal">
                If images affect your conversion rate, <strong>CommercePix is for you</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 md:py-32 bg-warm-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Makes CommercePix Different</h2>
              <p className="text-lg text-charcoal">Unlike generic AI tools, CommercePix is:</p>
            </div>

            <div className="space-y-6 pt-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Marketplace-specific, not general-purpose</h4>
                  <p className="text-muted-foreground">
                    Built exclusively for Amazon image requirements and buyer expectations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Controlled, not random</h4>
                  <p className="text-muted-foreground">
                    Structured workflows with compliance guardrails, not unpredictable outputs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Production-ready, not experimental</h4>
                  <p className="text-muted-foreground">
                    Every image is designed to convert, not just look creative
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-8">
              <p className="text-lg text-charcoal">
                It's not about creativity for creativity's sake.<br />
                It's about <strong>images that sell</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">Get Started</h2>
            <p className="text-xl text-charcoal">
              Create your first Amazon-ready product images today.
            </p>
            <div className="space-y-4">
              <p className="text-lg font-medium text-graphite">
                No photoshoot. No design software. No guesswork.
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="h-14 px-10 text-base font-semibold shadow-gold">
                  Start Creating Product Images
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="pt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Designed for Amazon sellers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Built for conversion</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Secure & private</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">CommercePix</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered product images for Amazon sellers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2026 CommercePix. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

