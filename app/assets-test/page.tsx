import { requireUser } from '@/lib/supabase/server'
import AssetsTestClient from '@/components/AssetsTestClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AssetsTestPage() {
  // Ensure user is logged in
  const user = await requireUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assets Database Test</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Testing Supabase assets table with complex relationships
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/projects-test">
                <button className="text-sm text-primary hover:underline">
                  Projects Test
                </button>
              </Link>
              <Link href="/app">
                <button className="text-sm text-primary hover:underline">
                  ← Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Info card */}
          <Card>
            <CardHeader>
              <CardTitle>Assets Database Testing</CardTitle>
              <CardDescription>
                This page demonstrates CRUD operations on the assets table with advanced features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    🎨 Features Being Tested:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>CREATE: Add input/output assets with metadata</li>
                    <li>READ: View assets filtered by project, kind, mode</li>
                    <li>DELETE: Remove assets</li>
                    <li>JSONB: Store and query structured prompt parameters</li>
                    <li>Relations: Link outputs to input sources</li>
                    <li>Constraints: Validate kind and mode enums</li>
                    <li>RLS: Only see your own assets</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Logged in as:</strong> {user.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assets CRUD interface */}
          <AssetsTestClient />

          {/* Technical details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium">Migration File:</span>
                  <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                    supabase/migrations/20260104225553_create_assets_table.sql
                  </code>
                </div>

                <div>
                  <span className="font-medium">Helper Functions:</span>
                  <div className="ml-4 mt-1 space-y-1">
                    <code className="block bg-muted px-2 py-1 rounded text-xs">
                      lib/db/asset-types.ts
                    </code>
                    <code className="block bg-muted px-2 py-1 rounded text-xs">
                      lib/db/assets.ts (server)
                    </code>
                    <code className="block bg-muted px-2 py-1 rounded text-xs">
                      lib/db/assets-client.ts (client)
                    </code>
                  </div>
                </div>

                <div>
                  <span className="font-medium">Schema Highlights:</span>
                  <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground space-y-1">
                    <li>kind: CHECK constraint (input, output)</li>
                    <li>mode: CHECK constraint (main_white, lifestyle, feature_callout, packaging)</li>
                    <li>source_asset_id: Self-referential FK for asset lineage</li>
                    <li>prompt_payload: JSONB with GIN index for fast queries</li>
                    <li>project_id: CASCADE delete when project deleted</li>
                  </ul>
                </div>

                <div>
                  <span className="font-medium">RLS Policies:</span>
                  <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground space-y-1">
                    <li>Users can only view their own assets</li>
                    <li>Users can only create assets for themselves</li>
                    <li>Users can only update their own assets</li>
                    <li>Users can only delete their own assets</li>
                  </ul>
                </div>

                <div>
                  <span className="font-medium">Additional Features:</span>
                  <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground space-y-1">
                    <li>Helper function: get_derived_assets()</li>
                    <li>View: asset_statistics (aggregated metrics)</li>
                    <li>Indexes on user_id, project_id, kind, mode, created_at</li>
                    <li>GIN index on prompt_payload JSONB</li>
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

