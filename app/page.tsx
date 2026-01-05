import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'
import type { Metadata } from 'next'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'CommercePix - AI Product Images for Amazon Sellers',
  description: 'Create compliant, professional Amazon product images in minutes using AI. Main images, lifestyle scenes, feature visuals, and packaging — all optimized for marketplace compliance.',
  keywords: ['Amazon product images', 'AI image generation', 'Amazon seller tools', 'product photography', 'marketplace images', 'Amazon compliance'],
  authors: [{ name: 'CommercePix' }],
  openGraph: {
    title: 'CommercePix - AI Product Images for Amazon Sellers',
    description: 'Create compliant, professional Amazon product images in minutes using AI. No photoshoots, studios, or Photoshop required.',
    url: 'https://commercepix.ai',
    siteName: 'CommercePix',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CommercePix - AI Product Images for Amazon',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CommercePix - AI Product Images for Amazon Sellers',
    description: 'Create compliant, professional Amazon product images in minutes using AI.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function HomePage() {
  // Check if user is logged in
  const user = await getUser()

  if (user) {
    // User is logged in, redirect to app
    redirect('/app')
  }

  // User is NOT logged in, show landing page
  return <LandingPage />
}
