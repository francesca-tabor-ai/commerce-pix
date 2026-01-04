import { requireUser } from '@/lib/supabase/server'
import StorageTestClient from '@/components/StorageTestClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StorageTestPage() {
  const user = await requireUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Storage Test</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Test Supabase Storage uploads, signed URLs, and file deletion
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/projects-test">
                <button className="text-sm text-primary hover:underline">Projects</button>
              </Link>
              <Link href="/assets-test">
                <button className="text-sm text-primary hover:underline">Assets</button>
              </Link>
              <Link href="/jobs-test">
                <button className="text-sm text-primary hover:underline">Jobs</button>
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
              <CardTitle>Supabase Storage Testing</CardTitle>
              <CardDescription>
                Test file uploads to private buckets with signed URL generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    📦 Storage Buckets:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>
                      <strong>commercepix-inputs</strong> - Private bucket for input images
                    </li>
                    <li>
                      <strong>commercepix-outputs</strong> - Private bucket for generated outputs
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    🧪 Features Being Tested:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>File upload with automatic path generation</li>
                    <li>Signed URL generation (1 hour expiry)</li>
                    <li>File deletion</li>
                    <li>Private bucket security (signed URLs required)</li>
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

          {/* Storage test interface */}
          <StorageTestClient userId={user.id} />

          {/* Technical details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium">Helper Functions:</span>
                  <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                    lib/storage/server.ts
                  </code>
                </div>

                <div>
                  <span className="font-medium">Storage Path Format:</span>
                  <div className="ml-4 mt-1 p-2 bg-muted rounded text-xs font-mono">
                    {'{bucket}'}/{'{user_id}'}/{'{project_id}'}/{'{filename}'}
                  </div>
                </div>

                <div>
                  <span className="font-medium">API Routes:</span>
                  <div className="ml-4 mt-1 space-y-1">
                    <code className="block bg-muted px-2 py-1 rounded text-xs">
                      POST /api/storage/upload - Upload file
                    </code>
                    <code className="block bg-muted px-2 py-1 rounded text-xs">
                      POST /api/storage/signed-url - Generate signed URL
                    </code>
                    <code className="block bg-muted px-2 py-1 rounded text-xs">
                      POST /api/storage/delete - Delete file
                    </code>
                  </div>
                </div>

                <div>
                  <span className="font-medium">Available Functions:</span>
                  <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground space-y-1">
                    <li>uploadFile(bucket, path, file, options)</li>
                    <li>getSignedUrl(bucket, path, expiresIn)</li>
                    <li>deleteFile(bucket, path)</li>
                    <li>uploadAsset(bucket, userId, projectId, assetId, file)</li>
                    <li>listFiles(bucket, path, options)</li>
                  </ul>
                </div>

                <div>
                  <span className="font-medium">Security:</span>
                  <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground space-y-1">
                    <li>Both buckets are private (not publicly accessible)</li>
                    <li>Signed URLs required to access files</li>
                    <li>Signed URLs expire after 1 hour</li>
                    <li>Files organized by user ID for isolation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

