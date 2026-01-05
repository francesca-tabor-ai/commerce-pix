import { cn } from '@/lib/utils'
import { classNames } from '@/lib/theme'

interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export function Container({ children, size = 'xl', className }: ContainerProps) {
  const sizeClasses = {
    sm: classNames.containerSm,
    md: classNames.containerMd,
    lg: classNames.containerLg,
    xl: classNames.containerXl,
    full: classNames.container,
  }

  return (
    <div className={cn(sizeClasses[size], className)}>
      {children}
    </div>
  )
}

