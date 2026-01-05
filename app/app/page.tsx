import { requireUser } from '@/lib/supabase/server'
import { getDashboardStats, getRecentOutputs } from '@/lib/db/dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/app/AppHeader'
import { 
  Zap, 
  Image as ImageIcon, 
  FolderOpen, 
  Plus, 
  Upload, 
  ArrowRight,
  Sparkles 
} from 'lucide-react'
import Link from 'next/link'
import { DashboardOutputGallery } from '@/components/dashboard/DashboardOutputGallery'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await requireUser()

  // Fetch dashboard data
  const [stats, recentOutputs] = await Promise.all([
    getDashboardStats(user.id),
    getRecentOutputs(user.id, 12)
  ])

  return (
    <>
      <AppHeader user={user} />
      
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your account
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Credit Balance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Credit Balance
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.creditBalance}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.creditBalance === 0 ? (
                  <span className="text-destructive font-medium">
                    Out of credits - upgrade to continue
                  </span>
                ) : stats.creditBalance <= 5 ? (
                  <span className="text-amber-600 font-medium">
                    Running low - consider upgrading
                  </span>
                ) : (
                  'Available for generations'
                )}
              </p>
              {stats.creditBalance <= 5 && (
                <Link href="/app/billing" className="mt-3 inline-block">
                  <Button size="sm" variant={stats.creditBalance === 0 ? 'default' : 'outline'}>
                    <Sparkles className="mr-2 h-3 w-3" />
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Images This Month Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Images Generated
              </CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.imagesThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>

          {/* Projects Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.lastProject ? (
                  <span>
                    Last: <span className="font-medium">{stats.lastProject.name}</span>
                  </span>
                ) : (
                  'No projects yet'
                )}
              </p>
              {stats.lastProject && (
                <Link href={`/app/projects/${stats.lastProject.id}`} className="mt-3 inline-block">
                  <Button size="sm" variant="outline">
                    Open Project
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/app/projects">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
            <Link href="/app/projects">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Product Photo
              </Button>
            </Link>
            <Link href="/app/billing">
              <Button variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                View Plans
              </Button>
            </Link>
            <Link href="/app/projects">
              <Button variant="outline">
                <FolderOpen className="mr-2 h-4 w-4" />
                View All Projects
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Outputs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Recent Outputs</h2>
              <p className="text-muted-foreground text-sm">
                Your latest generated images
              </p>
            </div>
            {recentOutputs.length > 0 && (
              <Link href="/app/projects">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {recentOutputs.length > 0 ? (
            <DashboardOutputGallery outputs={recentOutputs} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No images yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Upload a product photo and generate your first AI-powered image to get started
                </p>
                <Link href="/app/projects">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
