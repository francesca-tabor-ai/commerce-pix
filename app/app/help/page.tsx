import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  CheckCircle2,
  XCircle,
  Mail,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  Shield,
  Image as ImageIcon,
  Zap,
  HelpCircle,
} from 'lucide-react'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const SUPPORT_EMAIL = 'support@commercepix.com'

export default async function HelpPage() {
  const user = await requireUser()

  return (
    <div className="p-8 space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground text-lg">
          Everything you need to create perfect Amazon product images
        </p>
      </div>

      {/* Amazon Image Rules Quick Guide */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Amazon Image Rules (Quick Guide)</h2>
            <p className="text-muted-foreground">Essential requirements for Amazon listings</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Main Image Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Main Image (Required)
              </CardTitle>
              <CardDescription>Your primary product photo - strict rules apply</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="font-semibold text-sm">✅ Must Have:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Pure white background (RGB: 255, 255, 255)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Product fills 85% or more of frame</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Minimum 1000 pixels on longest side</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Professional product photography quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Accurate color representation</span>
                  </li>
                </ul>

                <p className="font-semibold text-sm mt-4">❌ Cannot Have:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Any text, logos, or graphics overlaid on image</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Props, accessories, or multiple items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Watermarks or borders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Mannequins or people (except for some categories)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t bg-primary/5 p-3 rounded-lg">
                <p className="text-sm font-medium">💡 Use our "Main White" mode</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatically generates Amazon-compliant main images
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Secondary Images (Flexible)
              </CardTitle>
              <CardDescription>Additional images - more creative freedom</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="font-semibold text-sm">✅ Can Include:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Lifestyle images showing product in use</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Feature callouts with text highlights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Size comparison images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Multiple angles of product</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Packaging and unboxing views</span>
                  </li>
                </ul>

                <p className="font-semibold text-sm mt-4">⚠️ Still Prohibited:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Fake or misleading information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Competitor references or comparisons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Promotional text (sale prices, discounts)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Graphic violence or explicit content</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t bg-primary/5 p-3 rounded-lg">
                <p className="text-sm font-medium">💡 Use our specialized modes</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Lifestyle, Feature Callout, and Packaging modes for secondary images
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="py-6">
            <div className="flex gap-4">
              <BookOpen className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <p className="font-semibold">Official Amazon Guidelines</p>
                <p className="text-sm text-muted-foreground">
                  For complete requirements, review Amazon's{' '}
                  <a
                    href="https://sellercentral.amazon.com/gp/help/1881"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Product Image Requirements
                  </a>{' '}
                  documentation. CommercePix is designed to help you comply automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Best Inputs for CommercePix */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Best Inputs for CommercePix</h2>
            <p className="text-muted-foreground">Tips to get the best results from AI generation</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Image Quality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Input Image Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm font-medium">✅ Best Practices:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>High resolution:</strong> At least 1000px on longest side
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Well-lit:</strong> Good lighting with no harsh shadows
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>In-focus:</strong> Sharp, clear product with no blur
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Clean background:</strong> Simple backdrop (any color OK)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Full product visible:</strong> No cropping of important parts
                    </span>
                  </li>
                </ul>

                <p className="text-sm font-medium mt-4">❌ Avoid:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Blurry or low-resolution photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Heavy shadows or poor lighting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Cluttered backgrounds with distractions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Extreme angles or distorted perspectives</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Product Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Product Descriptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm font-medium">✅ Effective Descriptions:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Be specific:</strong> "wireless Bluetooth headphones" not just
                      "headphones"
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Include materials:</strong> "stainless steel water bottle"
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Mention key features:</strong> "ergonomic office chair with lumbar
                      support"
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Keep it concise:</strong> 3-10 words is ideal
                    </span>
                  </li>
                </ul>

                <div className="bg-muted p-4 rounded-lg mt-4">
                  <p className="text-sm font-semibold mb-2">Good Examples:</p>
                  <ul className="space-y-1 text-xs font-mono">
                    <li>• "premium leather wallet with RFID protection"</li>
                    <li>• "organic cotton yoga mat 6mm thick"</li>
                    <li>• "stainless steel insulated coffee mug"</li>
                    <li>• "wireless gaming mouse with RGB lighting"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Tone Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Brand Tone Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Choose a brand tone that matches your target audience:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold">Pro</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Professional</p>
                    <p className="text-xs text-muted-foreground">
                      B2B products, office supplies, professional tools
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold">Lux</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Luxury</p>
                    <p className="text-xs text-muted-foreground">
                      Premium products, jewelry, high-end fashion
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold">Fun</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Playful</p>
                    <p className="text-xs text-muted-foreground">
                      Toys, games, youth products, fun consumer goods
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold">Min</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Minimal</p>
                    <p className="text-xs text-muted-foreground">
                      Modern tech, wellness, eco-friendly products
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold">Bold</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Bold</p>
                    <p className="text-xs text-muted-foreground">
                      Fashion, sports, lifestyle brands
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Tip:</strong> Set a default brand tone in{' '}
                  <Link href="/app/settings" className="text-primary hover:underline">
                    Settings
                  </Link>{' '}
                  to save time
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mode Selection Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Choosing the Right Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-1">Main White</p>
                  <p className="text-xs text-muted-foreground">
                    For Amazon main image slot. Pure white background, no props.
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-1">Lifestyle</p>
                  <p className="text-xs text-muted-foreground">
                    Show product in real-world use. Great for demonstrating context.
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-1">Feature Callout</p>
                  <p className="text-xs text-muted-foreground">
                    Highlight 3 key benefits with text. Perfect for infographic-style images.
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-1">Packaging</p>
                  <p className="text-xs text-muted-foreground">
                    Show retail packaging. Good for "what's in the box" images.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Troubleshooting Common Issues</h2>
            <p className="text-muted-foreground">Solutions to frequently encountered problems</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Generation failed or returned an error</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3 pt-4">
              <p className="font-semibold">Common causes and solutions:</p>
              <ul className="space-y-2 ml-4">
                <li>
                  <strong>Input image too small:</strong> Ensure your image is at least 1000px on
                  the longest side. Try uploading a higher resolution photo.
                </li>
                <li>
                  <strong>File size too large:</strong> Maximum file size is 10MB. Compress your
                  image before uploading.
                </li>
                <li>
                  <strong>Invalid file format:</strong> Only JPG, PNG, and WebP are supported.
                  Convert your image to one of these formats.
                </li>
                <li>
                  <strong>Rate limit exceeded:</strong> You've hit your per-minute or daily limit.
                  Wait a few minutes or upgrade your plan for higher limits.
                </li>
                <li>
                  <strong>Insufficient credits:</strong> Your account has no remaining credits.
                  Upgrade to a paid plan to continue generating.
                </li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                If the issue persists, contact support with your job ID for investigation.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Generated image doesn't match expectations</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3 pt-4">
              <p className="font-semibold">How to improve results:</p>
              <ul className="space-y-2 ml-4">
                <li>
                  <strong>More specific product description:</strong> Instead of "bottle", try
                  "stainless steel insulated water bottle with handle"
                </li>
                <li>
                  <strong>Choose appropriate brand tone:</strong> Luxury tone for premium products,
                  Playful for consumer goods, etc.
                </li>
                <li>
                  <strong>Use the right mode:</strong> Main White for Amazon main image, Lifestyle
                  for usage scenarios
                </li>
                <li>
                  <strong>Higher quality input:</strong> Better input photos produce better output.
                  Use well-lit, in-focus images.
                </li>
                <li>
                  <strong>Try multiple generations:</strong> AI results can vary. Generate 2-3
                  versions and pick the best.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Upload failed or stuck processing</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3 pt-4">
              <p className="font-semibold">Troubleshooting steps:</p>
              <ol className="space-y-2 ml-4 list-decimal">
                <li>Check your internet connection is stable</li>
                <li>Verify file size is under 10MB</li>
                <li>Ensure file format is JPG, PNG, or WebP</li>
                <li>Try refreshing the page and uploading again</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try a different browser (Chrome, Firefox, Safari)</li>
              </ol>
              <p className="mt-4 text-muted-foreground">
                If uploads consistently fail, there may be a temporary service issue. Check our
                status page or contact support.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Can't download or view generated images</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3 pt-4">
              <p className="font-semibold">Solutions:</p>
              <ul className="space-y-2 ml-4">
                <li>
                  <strong>Refresh the page:</strong> Sometimes images need a moment to load. Try
                  refreshing your browser.
                </li>
                <li>
                  <strong>Check browser permissions:</strong> Ensure downloads are enabled in your
                  browser settings.
                </li>
                <li>
                  <strong>Try incognito/private mode:</strong> Browser extensions can sometimes
                  interfere with downloads.
                </li>
                <li>
                  <strong>Check storage quota:</strong> Your device may be out of storage space.
                </li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                All generated images are stored securely for 90 days. You can always come back to
                download them later.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Billing or subscription issues</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3 pt-4">
              <p className="font-semibold">Common billing questions:</p>
              <ul className="space-y-2 ml-4">
                <li>
                  <strong>Credits not updating:</strong> Credits are deducted only after successful
                  generation. Failed generations don't consume credits.
                </li>
                <li>
                  <strong>Can't upgrade plan:</strong> Check that your payment method is valid and
                  has sufficient funds. Try a different card if issues persist.
                </li>
                <li>
                  <strong>Unexpected charges:</strong> Review your billing history in the{' '}
                  <Link href="/app/billing" className="text-primary hover:underline">
                    Billing
                  </Link>{' '}
                  section. Contact support if you see incorrect charges.
                </li>
                <li>
                  <strong>How credits work:</strong> 1 credit = 1 generation attempt. Credits reset
                  monthly based on your plan. Unused credits don't roll over.
                </li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                For billing inquiries, email{' '}
                <a href="mailto:billing@commercepix.com" className="text-primary hover:underline">
                  billing@commercepix.com
                </a>{' '}
                with your account email.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Amazon rejected my images</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3 pt-4">
              <p className="font-semibold">Most common reasons for rejection:</p>
              <ul className="space-y-2 ml-4">
                <li>
                  <strong>Used wrong mode for main image:</strong> Main image slot MUST use pure
                  white background. Use our "Main White" mode, not Lifestyle or Feature Callout.
                </li>
                <li>
                  <strong>Background not pure white:</strong> Ensure background is exactly RGB
                  (255, 255, 255). Our Main White mode handles this automatically.
                </li>
                <li>
                  <strong>Product too small in frame:</strong> Product must fill at least 85% of
                  image area.
                </li>
                <li>
                  <strong>Image resolution too low:</strong> Must be at least 1000px on longest
                  side. Our outputs are 1024x1024px.
                </li>
              </ul>
              <p className="mt-4 font-semibold">Best practice:</p>
              <p className="text-muted-foreground ml-4">
                Use Main White mode for slot 1, then use Lifestyle, Feature Callout, or Packaging
                modes for slots 2-7. This ensures compliance while maximizing visual appeal.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Contact Support */}
      <section className="space-y-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardContent className="py-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Still Need Help?</h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Our support team is here to help you succeed. We typically respond within 24
                  hours.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={`mailto:${SUPPORT_EMAIL}`}>
                  <Button size="lg" className="gap-2">
                    <Mail className="h-5 w-5" />
                    Email Support
                  </Button>
                </a>
                <Link href="/app/billing">
                  <Button variant="outline" size="lg">
                    Billing Questions
                  </Button>
                </Link>
              </div>

              <div className="pt-6 border-t border-border/50 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">
                  <strong>Support Email:</strong>{' '}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Include your account email and any relevant job IDs or screenshots for faster
                  resolution.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Links */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/app/projects">
                <Button variant="outline" className="w-full justify-start">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  My Projects
                </Button>
              </Link>
              <Link href="/app/billing">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Billing & Credits
                </Button>
              </Link>
              <Link href="/app/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  View Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
