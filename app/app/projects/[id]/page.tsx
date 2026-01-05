import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { requireUser } from '@/lib/supabase/server'
import { getProject } from '@/lib/db/projects'
import { getAssetsByProject } from '@/lib/db/assets'
import { AppHeader } from '@/components/app/AppHeader'
import { ProjectWorkspace } from '@/components/workspace/ProjectWorkspace'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await requireUser()
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  // Fetch assets for the project
  const assets = await getAssetsByProject(params.id)
  const outputAssets = assets?.filter(a => a.kind === 'output') || []

  return (
    <>
      <AppHeader user={user} />
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/app/projects">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1">
              Created {new Date(project.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Workspace */}
        <ProjectWorkspace
          projectId={params.id}
          initialOutputs={outputAssets}
        />
      </div>
    </>
  )
}
