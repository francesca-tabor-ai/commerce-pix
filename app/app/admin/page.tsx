import { requireAdmin } from '@/lib/auth/admin'
import { getAdminStats, getRecentGenerationJobs } from '@/lib/db/admin-stats'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  Image as ImageIcon,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // Require admin access
  const user = await requireAdmin()

  // Fetch all stats
  const [stats, recentJobs] = await Promise.all([
    getAdminStats(),
    getRecentGenerationJobs(20),
  ])

  // Helper to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Succeeded
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case 'running':
        return (
          <Badge variant="secondary">
            <Activity className="h-3 w-3 mr-1" />
            Running
          </Badge>
        )
      case 'queued':
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Queued
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Internal analytics and system overview • Logged in as{' '}
          <span className="font-medium">{user.email}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered accounts in system
            </p>
          </CardContent>
        </Card>

        {/* Total Generations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalGenerations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              AI images generated (output assets)
            </p>
          </CardContent>
        </Card>

        {/* Average per User */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalUsers > 0
                ? (stats.totalGenerations / stats.totalUsers).toFixed(1)
                : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Images generated per user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
          <CardDescription>
            How users are distributed across subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.planDistribution.map((plan) => (
              <div key={plan.planName} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{plan.planName}</span>
                    <span className="text-sm text-muted-foreground">
                      {plan.userCount} user{plan.userCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${plan.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <span className="text-lg font-bold">{plan.percentage}%</span>
                </div>
              </div>
            ))}

            {stats.planDistribution.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No subscription data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Generation Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Generation Jobs</CardTitle>
          <CardDescription>Last 20 generation jobs with status and details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobs.length > 0 ? (
                  recentJobs.map((job) => {
                    const duration = job.completed_at
                      ? Math.round(
                          (new Date(job.completed_at).getTime() -
                            new Date(job.created_at).getTime()) /
                            1000
                        )
                      : null

                    return (
                      <TableRow key={job.id}>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {job.user_email || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {job.project_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.mode}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(job.created_at), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {duration !== null ? `${duration}s` : '-'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                          {job.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No generation jobs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Access:</strong> This dashboard is restricted to admin users only
              (ADMIN_EMAILS env var)
            </p>
            <p>
              <strong>Data:</strong> All metrics are calculated in real-time from the database
            </p>
            <p>
              <strong>Note:</strong> This is MVP analytics. Enhanced analytics coming soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

