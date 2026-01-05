'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FolderOpen, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { RenameProjectDialog } from './RenameProjectDialog'
import { DeleteProjectDialog } from './DeleteProjectDialog'
import type { Project } from '@/lib/db/types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleRename = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setRenameDialogOpen(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 group relative">
        {/* Link wraps most of the card */}
        <Link href={`/app/projects/${project.id}`} className="block">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              
              {/* Actions Menu - Stops propagation to prevent navigation */}
              <div onClick={(e) => e.preventDefault()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleRename}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardTitle className="mt-4">{project.name}</CardTitle>
            <CardDescription>
              Created {new Date(project.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Click to view project details
            </div>
          </CardContent>
        </Link>
      </Card>

      {/* Dialogs */}
      <RenameProjectDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        projectId={project.id}
        currentName={project.name}
      />
      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        projectId={project.id}
        projectName={project.name}
      />
    </>
  )
}

