import { requireUser } from '@/lib/supabase/server'
import GenerationJobsTestClient from '@/components/GenerationJobsTestClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function GenerationJobsTestPage() {
  // Ensure user is logged in
  const user = await requireUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generation Jobs Test</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Testing Supabase generation_jobs table with status tracking
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/projects-test">
                <button className="text-sm text-primary hover:underline">
                  Projects
                </button>
              </Link>
              <Link href="/assets-test">
                <button className="text-sm text-primary hover:underline">
                  Assets
                </button>
              </Link>
              <Link href="/app">
                <button className="text-sm text-primary hover:underline">
                  ← Dashboard
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
              <CardTitle>Generation Jobs Database Testing</CardTitle>
              <CardDescription>
                Track AI generation tasks with status management and cost tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    ⚙️ Features Being Tested:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>CREATE: Queue new generation jobs</li>
                    <li>READ: View jobs by project and status</li>
                    <li>UPDATE: Transition job status (queued → running → succeeded/failed)</li>
                    <li>DELETE: Remove completed jobs</li>
                    <li>Status Management: Validate state transitions</li>
                    <li>Cost Tracking: Track generation costs in cents</li>
                    <li>Statistics: View job counts and costs by status</li>
                    <li>RLS: Only see your own jobs</li>
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

          {/* Jobs CRUD interface */}
          <GenerationJobsTestClient />

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
                    supabase/migrations/20260104230101_create_generation_jobs_table.sql
                  </code>
                </div>

                <div>
                  <span className="font-medium">Helper Functions:</span>
                  <div className="ml-4 mt-1 space-y-1">
                    <code className="block bg-muted px-2 py-1 rounded text-xs">
                      lib/db/job-types.ts
                    </code>
                    <code className="block bg-muted px-2 py-1 rounded text-xs">
                      lib/db/generation-jobs.ts (server)
                    </code>
                    <code className="block bg-muted px-2 py-1 rounded text-xs">
                      lib/db/generation-jobs-client.ts (client)
                    </code>
                  </div>
                </div>

                <div>
                  <span className="font-medium">Schema Highlights:</span>
                  <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground space-y-1">
                    <li>status: CHECK constraint (queued, running, succeeded, failed)</li>
                    <li>cost_cents: INTEGER for tracking generation costs</li>
                    <li>error: TEXT field for failure messages</li>
                    <li>input_asset_id: FK to assets (optional)</li>
                    <li>project_id: CASCADE delete when project deleted</li>
                  </ul>
                </div>

                <div>
                  <span className="font-medium">SQL Functions:</span>
                  <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground space-y-1">
                    <li>get_job_statistics() - Aggregated counts and costs by status</li>
                    <li>get_recent_jobs() - Latest N jobs</li>
                    <li>transition_job_status() - Safe status transitions with validation</li>
                  </ul>
                </div>

                <div>
                  <span className="font-medium">Views:</span>
                  <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground space-y-1">
                    <li>generation_job_summary - Stats grouped by project and status</li>
                  </ul>
                </div>

                <div>
                  <span className="font-medium">Status Workflow:</span>
                  <div className="ml-4 mt-1 p-2 bg-muted rounded text-xs">
                    queued → running → succeeded / failed
                  </div>
                  <p className="ml-4 mt-1 text-xs text-muted-foreground">
                    Terminal states (succeeded/failed) cannot be transitioned
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

