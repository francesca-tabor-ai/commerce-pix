import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://commercepix.ai'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/app/',
          '/api/',
          '/auth/reset-password',
          '/*-test',
          '/demo-helpers',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

