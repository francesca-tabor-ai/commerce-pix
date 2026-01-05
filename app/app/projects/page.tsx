import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FolderOpen } from 'lucide-react'
import { requireUser } from '@/lib/supabase/server'
import { getProjects } from '@/lib/db/projects'
import { AppHeader } from '@/components/app/AppHeader'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'
import { ProjectCard } from '@/components/projects/ProjectCard'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const user = await requireUser()
  const projects = await getProjects()

  return (
    <>
      <AppHeader user={user} />
      
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Organize your product images by project
            </p>
          </div>
          <CreateProjectDialog />
        </div>

        {/* Projects Grid */}
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                Create your first project to start organizing your product images
              </p>
              <CreateProjectDialog
                trigger={
                  <Button>
                    Create Project
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
