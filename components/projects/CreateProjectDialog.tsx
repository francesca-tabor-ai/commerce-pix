'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createProjectAction } from '@/app/actions/projects'
import { useRouter } from 'next/navigation'

interface CreateProjectDialogProps {
  trigger?: React.ReactNode
}

export function CreateProjectDialog({ trigger }: CreateProjectDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!projectName.trim()) {
      toast.error('Project name is required')
      return
    }

    setLoading(true)

    try {
      const result = await createProjectAction(projectName)

      if (result.success) {
        toast.success('Project created!', {
          description: `${projectName} has been created successfully`
        })
        setOpen(false)
        setProjectName('')
        
        // Navigate to the new project
        if (result.projectId) {
          router.push(`/app/projects/${result.projectId}`)
        }
      } else {
        toast.error('Failed to create project', {
          description: result.error
        })
      }
    } catch (error) {
      toast.error('Unexpected error', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      handleCreate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Give your project a name. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="e.g., Summer 2024 Campaign"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {projectName.length}/100 characters
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading || !projectName.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

