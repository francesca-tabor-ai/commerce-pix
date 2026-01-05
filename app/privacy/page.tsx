import SiteHeader from '@/components/site/SiteHeader'
import SiteFooter from '@/components/site/SiteFooter'
import { Container, Section } from '@/components/ui/primitives'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - CommercePix',
  description: 'Privacy Policy for CommercePix - Learn how we collect, use, and protect your personal information.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      <Section>
        <Container size="md">
          <div className="prose prose-slate max-w-none">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 5, 2026</p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground">
                  CommercePix ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
                  how we collect, use, disclose, and safeguard your information when you use our Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Account Information</h3>
                <p className="text-muted-foreground mb-4">When you create an account, we collect:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Email address</li>
                  <li>Name</li>
                  <li>Password (encrypted)</li>
                  <li>Payment information (processed securely by our payment provider)</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">Usage Information</h3>
                <p className="text-muted-foreground mb-4">We automatically collect information about your use of the Service:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Images you upload for generation</li>
                  <li>Generated images and parameters used</li>
                  <li>Usage statistics and generation history</li>
                  <li>Device information and IP address</li>
                  <li>Browser type and version</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">Communication Data</h3>
                <p className="text-muted-foreground">
                  If you contact our support team, we collect the contents of your messages and any attachments you send.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">We use the collected information to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide and maintain the Service</li>
                  <li>Process your image generation requests</li>
                  <li>Manage your account and subscription</li>
                  <li>Process payments and prevent fraud</li>
                  <li>Improve our AI models and Service quality</li>
                  <li>Send you service-related communications</li>
                  <li>Respond to your inquiries and support requests</li>
                  <li>Analyze usage patterns and trends</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
                <p className="text-muted-foreground mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure cloud storage with reputable providers</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Automatic deletion of generated images after 30 days (unless saved to your account)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell your personal information. We may share your data with:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Service Providers:</strong> Third-party vendors who help us operate the Service (e.g., cloud hosting, payment processing)</li>
                  <li><strong>AI Model Providers:</strong> To process your image generation requests (data is anonymized where possible)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, subpoena, or legal process</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
                <p className="text-muted-foreground mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct your information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Export:</strong> Download your generated images and data</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Object:</strong> Object to certain data processing activities</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise these rights, contact us at{' '}
                  <a href="mailto:privacy@commercepix.ai" className="text-primary hover:underline">
                    privacy@commercepix.ai
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
                <p className="text-muted-foreground mb-4">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Maintain your session and keep you logged in</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze Service usage and performance</li>
                  <li>Provide personalized features</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  You can control cookies through your browser settings, but some features may not function properly 
                  if cookies are disabled.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your personal information for as long as your account is active or as needed to provide 
                  the Service. Generated images are stored for 30 days unless saved to your account. After account 
                  deletion, we retain some information as required for legal, security, and business purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our Service is not intended for users under the age of 18. We do not knowingly collect personal 
                  information from children. If you believe we have collected information from a child, please 
                  contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries other than your country of residence. 
                  We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Third-Party Links</h2>
                <p className="text-muted-foreground">
                  Our Service may contain links to third-party websites. We are not responsible for the privacy practices 
                  of these external sites. We encourage you to review their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. California Privacy Rights</h2>
                <p className="text-muted-foreground">
                  If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), 
                  including the right to know what personal information we collect, the right to delete your information, 
                  and the right to opt-out of the sale of your personal information (we do not sell personal information).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">13. GDPR Compliance</h2>
                <p className="text-muted-foreground">
                  If you are located in the European Economic Area (EEA), you have rights under the General Data Protection 
                  Regulation (GDPR), including rights to access, rectification, erasure, restriction, portability, and 
                  objection to processing of your personal data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">14. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by 
                  email or through a prominent notice on the Service. Your continued use of the Service after changes 
                  constitutes acceptance of the updated Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">15. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="mt-4 text-muted-foreground">
                  <p>Email: <a href="mailto:privacy@commercepix.ai" className="text-primary hover:underline">privacy@commercepix.ai</a></p>
                  <p className="mt-2">Data Protection Officer: <a href="mailto:dpo@commercepix.ai" className="text-primary hover:underline">dpo@commercepix.ai</a></p>
                </div>
              </section>
            </div>
          </div>
        </Container>
      </Section>

      <SiteFooter />
    </div>
  )
}

