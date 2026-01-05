import SiteHeader from '@/components/site/SiteHeader'
import SiteFooter from '@/components/site/SiteFooter'
import { Container, Section } from '@/components/ui/primitives'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - CommercePix',
  description: 'Terms of Service for CommercePix - AI-powered product image generation for Amazon sellers.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      <Section>
        <Container size="md">
          <div className="prose prose-slate max-w-none">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 5, 2026</p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using CommercePix ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                  If you disagree with any part of the terms, you may not access the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground mb-4">
                  CommercePix provides AI-powered product image generation services specifically designed for Amazon sellers 
                  and e-commerce businesses. Our Service allows you to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Generate main product images with white backgrounds</li>
                  <li>Create lifestyle and contextual product images</li>
                  <li>Design feature callout and benefit images</li>
                  <li>Produce packaging and unboxing visuals</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
                <p className="text-muted-foreground">
                  You must provide accurate and complete information when creating an account. You are responsible for 
                  maintaining the security of your account credentials and for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Usage Rights and Restrictions</h2>
                <p className="text-muted-foreground mb-4">
                  Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable 
                  license to use the Service. You agree not to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Attempt to reverse engineer or compromise the Service</li>
                  <li>Share your account credentials with others</li>
                  <li>Generate content that violates intellectual property rights</li>
                  <li>Use the Service to create misleading or deceptive content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Generated Content Ownership</h2>
                <p className="text-muted-foreground">
                  You retain all rights to the images you generate using our Service. CommercePix does not claim ownership 
                  of your generated content. However, you grant us a license to use generated images for service improvement 
                  and quality assurance purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Pricing and Payment</h2>
                <p className="text-muted-foreground mb-4">
                  Pricing for our Service is as described on our pricing page. By subscribing to a paid plan, you agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Pay all applicable fees for your chosen subscription tier</li>
                  <li>Authorize automatic renewal unless canceled</li>
                  <li>Accept that fees are non-refundable except as required by law</li>
                  <li>Pay overage charges for usage beyond your plan limits</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Refund Policy</h2>
                <p className="text-muted-foreground">
                  We offer a 14-day money-back guarantee for first-time subscribers. After the initial 14 days, all fees 
                  are non-refundable unless otherwise required by applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
                <p className="text-muted-foreground">
                  We strive to maintain high availability but do not guarantee uninterrupted access to the Service. 
                  We reserve the right to modify, suspend, or discontinue the Service at any time with reasonable notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  CommercePix shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                  resulting from your use of or inability to use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Amazon Compliance</h2>
                <p className="text-muted-foreground">
                  While we design our Service to help create Amazon-compliant images, you are solely responsible for 
                  ensuring your product images meet Amazon's current requirements and policies before uploading them 
                  to the Amazon marketplace.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason, 
                  including breach of these Terms. You may cancel your account at any time through your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms at any time. We will notify you of significant changes via 
                  email or through the Service. Your continued use of the Service after changes constitutes acceptance 
                  of the modified Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms shall be governed by and construed in accordance with the laws of the United States, 
                  without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms, please contact us at:
                  <br />
                  <a href="mailto:legal@commercepix.ai" className="text-primary hover:underline">
                    legal@commercepix.ai
                  </a>
                </p>
              </section>
            </div>
          </div>
        </Container>
      </Section>

      <SiteFooter />
    </div>
  )
}

