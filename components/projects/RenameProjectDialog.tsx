'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { renameProjectAction } from '@/app/actions/projects'

interface RenameProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  currentName: string
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  projectId,
  currentName,
}: RenameProjectDialogProps) {
  const [projectName, setProjectName] = useState(currentName)
  const [loading, setLoading] = useState(false)

  // Reset name when dialog opens or currentName changes
  useEffect(() => {
    if (open) {
      setProjectName(currentName)
    }
  }, [open, currentName])

  const handleRename = async () => {
    if (!projectName.trim()) {
      toast.error('Project name is required')
      return
    }

    if (projectName.trim() === currentName) {
      onOpenChange(false)
      return
    }

    setLoading(true)

    try {
      const result = await renameProjectAction(projectId, projectName)

      if (result.success) {
        toast.success('Project renamed!', {
          description: `Project renamed to "${projectName}"`
        })
        onOpenChange(false)
      } else {
        toast.error('Failed to rename project', {
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
      handleRename()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Enter a new name for this project
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rename-project-name">Project Name</Label>
            <Input
              id="rename-project-name"
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
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            disabled={loading || !projectName.trim() || projectName.trim() === currentName}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

