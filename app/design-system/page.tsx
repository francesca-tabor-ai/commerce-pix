'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container, Section, CTAButton, Alert, Skeleton, SkeletonCard, SkeletonText } from '@/components/ui/primitives'
import { toast } from 'sonner'
import Link from 'next/link'

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <Container>
          <div className="py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Design System</h1>
            <Link href="/">
              <Button variant="outline" size="sm">Back Home</Button>
            </Link>
          </div>
        </Container>
      </header>

      {/* Content */}
      <Section>
        <Container size="xl">
          <div className="space-y-12">
            {/* Typography */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Typography</h2>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold">Heading 1</h1>
                <h2 className="text-3xl font-bold">Heading 2</h2>
                <h3 className="text-2xl font-semibold">Heading 3</h3>
                <h4 className="text-xl font-semibold">Heading 4</h4>
                <p className="text-base">Body text - The quick brown fox jumps over the lazy dog</p>
                <p className="text-sm text-muted-foreground">Small text - The quick brown fox jumps over the lazy dog</p>
              </div>
            </div>

            {/* Buttons */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Buttons</h2>
              <div className="flex flex-wrap gap-4">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <CTAButton showArrow>CTA Button</CTAButton>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* Alerts */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Alerts</h2>
              <div className="space-y-4">
                <Alert variant="info" title="Info Alert">
                  This is an informational message.
                </Alert>
                <Alert variant="success" title="Success Alert" onClose={() => console.log('closed')}>
                  Your action was completed successfully!
                </Alert>
                <Alert variant="warning" title="Warning Alert">
                  Please review this important information.
                </Alert>
                <Alert variant="error" title="Error Alert">
                  Something went wrong. Please try again.
                </Alert>
              </div>
            </div>

            {/* Toasts */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Toasts</h2>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => toast('Default toast message')}>
                  Default Toast
                </Button>
                <Button onClick={() => toast.success('Success toast message')}>
                  Success Toast
                </Button>
                <Button onClick={() => toast.error('Error toast message')}>
                  Error Toast
                </Button>
                <Button onClick={() => toast.warning('Warning toast message')}>
                  Warning Toast
                </Button>
                <Button onClick={() => toast.info('Info toast message')}>
                  Info Toast
                </Button>
                <Button onClick={() => toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 2000)),
                  {
                    loading: 'Loading...',
                    success: 'Done!',
                    error: 'Error!',
                  }
                )}>
                  Promise Toast
                </Button>
              </div>
            </div>

            {/* Skeletons */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Skeleton Loaders</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonCard />
                <div className="space-y-4 p-6 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton variant="circular" width={40} height={40} />
                    <SkeletonText lines={2} />
                  </div>
                  <Skeleton variant="rectangular" height={100} />
                </div>
                <div className="space-y-4">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="rectangular" height={200} />
                </div>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card description goes here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Card content with some text.</p>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Glass Card</CardTitle>
                    <CardDescription>With glassmorphism effect</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Glass effect card content.</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-soft-lg transition-all duration-200">
                  <CardHeader>
                    <CardTitle>Hover Card</CardTitle>
                    <CardDescription>Hover to see shadow effect</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Hover over this card.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sections */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Sections</h2>
              <Section size="sm" background="warm">
                <Container size="md">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">Warm Background Section</h3>
                    <p className="text-muted-foreground">This section has a warm off-white background.</p>
                  </div>
                </Container>
              </Section>

              <Section size="sm" background="gradient">
                <Container size="md">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">Gradient Background Section</h3>
                    <p className="text-muted-foreground">This section has a subtle gradient background.</p>
                  </div>
                </Container>
              </Section>
            </div>

            {/* Colors */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Colors</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-primary" />
                  <p className="text-sm font-medium">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-secondary" />
                  <p className="text-sm font-medium">Secondary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-accent" />
                  <p className="text-sm font-medium">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-destructive" />
                  <p className="text-sm font-medium">Destructive</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-muted" />
                  <p className="text-sm font-medium">Muted</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-card border" />
                  <p className="text-sm font-medium">Card</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-background border" />
                  <p className="text-sm font-medium">Background</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg glass" />
                  <p className="text-sm font-medium">Glass</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}

