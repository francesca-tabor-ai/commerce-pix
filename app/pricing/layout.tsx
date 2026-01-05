import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - CommercePix | AI Product Images for Amazon',
  description: 'Simple, transparent pricing for AI-powered Amazon product images. Plans from $19/month with pay-as-you-go credits. 14-day free trial on all plans.',
  keywords: ['CommercePix pricing', 'Amazon image generation pricing', 'product photography pricing', 'AI image costs'],
  openGraph: {
    title: 'Pricing - CommercePix',
    description: 'Simple, transparent pricing for AI-powered Amazon product images. Start from $19/month with a 14-day free trial.',
    url: 'https://commercepix.ai/pricing',
    siteName: 'CommercePix',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CommercePix Pricing',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - CommercePix',
    description: 'Simple, transparent pricing for AI-powered Amazon product images. Start from $19/month.',
    images: ['/og-image.png'],
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

