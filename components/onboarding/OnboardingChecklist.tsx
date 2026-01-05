'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Circle,
  Upload,
  Image as ImageIcon,
  Palmtree,
  Download,
  X,
  PartyPopper,
} from 'lucide-react'
import { toast } from 'sonner'
import { dismissOnboardingAction, getOnboardingProgressAction } from '@/app/actions/onboarding'
import type { OnboardingProgress } from '@/lib/db/onboarding'
import { cn } from '@/lib/utils'

interface OnboardingChecklistProps {
  initialProgress: OnboardingProgress
  initialShouldShow: boolean
}

interface ChecklistTask {
  key: keyof Pick<
    OnboardingProgress,
    'uploaded_photo' | 'generated_main_image' | 'generated_lifestyle_image' | 'downloaded_asset'
  >
  icon: React.ElementType
  label: string
  description: string
  link?: string
}

const CHECKLIST_TASKS: ChecklistTask[] = [
  {
    key: 'uploaded_photo',
    icon: Upload,
    label: 'Upload a product photo',
    description: 'Upload your first product image to get started',
    link: '/app/projects',
  },
  {
    key: 'generated_main_image',
    icon: ImageIcon,
    label: 'Generate a main image',
    description: 'Create an Amazon-compliant white background image',
  },
  {
    key: 'generated_lifestyle_image',
    icon: Palmtree,
    label: 'Generate a lifestyle image',
    description: 'Create a lifestyle image showing your product in use',
  },
  {
    key: 'downloaded_asset',
    icon: Download,
    label: 'Download your first asset',
    description: 'Download a generated image to use in your listing',
  },
]

export default function OnboardingChecklist({
  initialProgress,
  initialShouldShow,
}: OnboardingChecklistProps) {
  const [progress, setProgress] = useState<OnboardingProgress>(initialProgress)
  const [shouldShow, setShouldShow] = useState(initialShouldShow)
  const [isDismissing, setIsDismissing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Calculate completion stats
  const completedTasks = CHECKLIST_TASKS.filter((task) => progress[task.key]).length
  const totalTasks = CHECKLIST_TASKS.length
  const percentage = Math.round((completedTasks / totalTasks) * 100)
  const isComplete = completedTasks === totalTasks

  // Refresh progress periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await getOnboardingProgressAction()
      if (result.success && result.progress) {
        setProgress(result.progress)
        setShouldShow(result.shouldShow || false)
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Auto-hide when complete
  useEffect(() => {
    if (isComplete && !progress.checklist_dismissed) {
      // Show celebration toast
      toast.success('🎉 Congratulations!', {
        description: "You've completed the onboarding checklist!",
        duration: 5000,
      })

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        handleDismiss()
      }, 3000)
    }
  }, [isComplete, progress.checklist_dismissed])

  const handleDismiss = async () => {
    setIsDismissing(true)

    try {
      const result = await dismissOnboardingAction()

      if (result.success) {
        setShouldShow(false)
        toast.success('Checklist hidden', {
          description: 'You can always view your progress in settings',
        })
      } else {
        toast.error('Failed to dismiss checklist', {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsDismissing(false)
    }
  }

  if (!shouldShow) {
    return null
  }

  if (isCollapsed) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PartyPopper className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Getting Started Checklist</p>
                <p className="text-xs text-muted-foreground">
                  {completedTasks} of {totalTasks} tasks complete
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={percentage} className="w-24" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(false)}
                className="text-xs"
              >
                Expand
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <PartyPopper className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Getting Started</CardTitle>
              <CardDescription>
                Complete these steps to master CommercePix
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="text-xs"
            >
              Collapse
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              disabled={isDismissing}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {completedTasks} of {totalTasks} complete
            </span>
            <span className="text-sm text-muted-foreground">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {CHECKLIST_TASKS.map((task) => {
          const Icon = task.icon
          const isCompleted = progress[task.key]

          return (
            <div
              key={task.key}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-all',
                isCompleted
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-background border-border hover:bg-muted/50'
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCompleted && 'line-through text-muted-foreground'
                    )}
                  >
                    {task.label}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
              </div>

              {!isCompleted && task.link && (
                <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                  <a href={task.link}>Start</a>
                </Button>
              )}
            </div>
          )
        })}

        {isComplete && (
          <div className="pt-4 border-t">
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-primary">
                🎉 Congratulations! You're all set!
              </p>
              <p className="text-xs text-muted-foreground">
                You've completed all onboarding tasks. Start creating amazing product images!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
