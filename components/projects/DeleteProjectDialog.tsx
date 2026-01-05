'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { deleteProjectAction } from '@/app/actions/projects'

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
}: DeleteProjectDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const result = await deleteProjectAction(projectId)

      if (result.success) {
        toast.success('Project deleted', {
          description: `"${projectName}" has been permanently deleted`
        })
        onOpenChange(false)
      } else {
        toast.error('Failed to delete project', {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Delete Project</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete "<strong>{projectName}</strong>"? 
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Warning:</strong> This action cannot be undone. All assets and generated images associated with this project will also be deleted.
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
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

