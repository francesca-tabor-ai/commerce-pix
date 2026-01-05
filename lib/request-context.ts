import { headers } from 'next/headers'
import { randomBytes } from 'crypto'

/**
 * Generate a new request ID
 */
export function generateRequestId(): string {
  return randomBytes(8).toString('hex')
}

/**
 * Get or generate a request ID for the current request
 * Used for tracing requests across logs and services
 */
export async function getRequestId(): Promise<string> {
  const headersList = await headers()
  const existingId = headersList.get('x-request-id')
  
  if (existingId) {
    return existingId
  }
  
  // Generate a new request ID if none exists
  return generateRequestId()
}

