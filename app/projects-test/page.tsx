import { requireUser } from '@/lib/supabase/server'
import ProjectsTestClient from '@/components/ProjectsTestClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function ProjectsTestPage() {
  // Ensure user is logged in
  const user = await requireUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects Database Test</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Testing Supabase projects table with RLS
              </p>
            </div>
            <Link href="/app">
              <button className="text-sm text-primary hover:underline">
                ← Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Info card */}
          <Card>
            <CardHeader>
              <CardTitle>Database Testing</CardTitle>
              <CardDescription>
                This page demonstrates CRUD operations on the projects table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  🗄️ Features Being Tested:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>CREATE: Add new projects</li>
                  <li>READ: View all your projects</li>
                  <li>UPDATE: Edit project names</li>
                  <li>DELETE: Remove projects</li>
                  <li>Row Level Security: Only see your own projects</li>
                  <li>User authentication: Logged in as {user.email}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Projects CRUD interface */}
          <ProjectsTestClient />

          {/* Technical details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Migration File:</span>
                  <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                    supabase/migrations/20260104225132_create_projects_table.sql
                  </code>
                </div>
                <div>
                  <span className="font-medium">Helper Functions:</span>
                  <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                    lib/db/projects.ts
                  </code>
                </div>
                <div>
                  <span className="font-medium">RLS Policies:</span>
                  <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                    <li>Users can only view their own projects</li>
                    <li>Users can only create projects for themselves</li>
                    <li>Users can only update their own projects</li>
                    <li>Users can only delete their own projects</li>
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

