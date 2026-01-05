import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

interface AlertProps {
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  onClose?: () => void
  className?: string
}

const variantStyles = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
    icon: 'text-blue-600 dark:text-blue-400',
    Icon: Info,
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
    icon: 'text-green-600 dark:text-green-400',
    Icon: CheckCircle2,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200',
    icon: 'text-amber-600 dark:text-amber-400',
    Icon: AlertTriangle,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
    icon: 'text-red-600 dark:text-red-400',
    Icon: AlertCircle,
  },
}

export function Alert({ 
  children, 
  variant = 'info', 
  title,
  onClose,
  className 
}: AlertProps) {
  const styles = variantStyles[variant]
  const Icon = styles.Icon

  return (
    <div className={cn('rounded-lg border p-4', styles.container, className)}>
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', styles.icon)} />
        <div className="flex-1 space-y-1">
          {title && <p className="font-semibold">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn('flex-shrink-0 hover:opacity-70 transition-opacity', styles.icon)}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

