import { requireUser } from '@/lib/supabase/server'
import APITestClient from '@/components/APITestClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function APITestPage() {
  const user = await requireUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Test</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Test all Commerce PIX API endpoints
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/projects-test">
                <button className="text-sm text-primary hover:underline">Projects</button>
              </Link>
              <Link href="/jobs-test">
                <button className="text-sm text-primary hover:underline">Jobs</button>
              </Link>
              <Link href="/storage-test">
                <button className="text-sm text-primary hover:underline">Storage</button>
              </Link>
              <Link href="/app">
                <button className="text-sm text-primary hover:underline">← Dashboard</button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Info card */}
          <Card>
            <CardHeader>
              <CardTitle>Commerce PIX API Testing</CardTitle>
              <CardDescription>
                Test the complete asset upload, AI generation, and signed URL workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    🌐 API Endpoints:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>
                      <strong>POST /api/assets/upload</strong> - Upload input images
                    </li>
                    <li>
                      <strong>POST /api/generate</strong> - Trigger AI generation (OpenAI DALL-E)
                    </li>
                    <li>
                      <strong>GET /api/assets/[id]/signed-url</strong> - Get signed URLs
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    🔒 Security:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>All endpoints require authentication</li>
                    <li>OpenAI calls happen server-side only</li>
                    <li>Users can only access their own assets</li>
                    <li>Signed URLs expire after 1 hour</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Logged in as:</strong> {user.email}
                  </p>
                  <p className="text-xs text-blue-700">
                    <strong>User ID:</strong> {user.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API test interface */}
          <APITestClient userId={user.id} />

          {/* Technical details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium">API Routes:</span>
                  <div className="ml-4 mt-1 space-y-1">
                    <code className="block bg-muted px-2 py-1 rounded text-xs">
                      app/api/assets/upload/route.ts
                    </code>
                    <code className="block bg-muted px-2 py-1 rounded text-xs">
                      app/api/generate/route.ts
                    </code>
                    <code className="block bg-muted px-2 py-1 rounded text-xs">
                      app/api/assets/[id]/signed-url/route.ts
                    </code>
                  </div>
                </div>

                <div>
                  <span className="font-medium">OpenAI Integration:</span>
                  <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground space-y-1">
                    <li>Model: DALL-E 3</li>
                    <li>Size: 1024x1024</li>
                    <li>Quality: Standard</li>
                    <li>Cost: $0.04 per image (4 cents)</li>
                    <li>Prompts: Auto-generated based on mode</li>
                  </ul>
                </div>

                <div>
                  <span className="font-medium">Generation Modes:</span>
                  <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground space-y-1">
                    <li><strong>main_white:</strong> Product on white background</li>
                    <li><strong>lifestyle:</strong> Product in real-world setting</li>
                    <li><strong>feature_callout:</strong> Highlights key features</li>
                    <li><strong>packaging:</strong> Product in retail packaging</li>
                  </ul>
                </div>

                <div>
                  <span className="font-medium">Workflow:</span>
                  <ol className="list-decimal list-inside ml-4 mt-1 text-muted-foreground space-y-1">
                    <li>Upload input image → Creates input asset</li>
                    <li>Trigger generation → Creates job, calls OpenAI</li>
                    <li>Job processes → Downloads & uploads output asset</li>
                    <li>Get signed URL → View input or output asset</li>
                  </ol>
                </div>

                <div>
                  <span className="font-medium">Environment Variable:</span>
                  <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                    OPENAI_API_KEY=your-key-here
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

