import { cn } from '@/lib/utils'
import { classNames } from '@/lib/theme'

interface SectionProps {
  children: React.ReactNode
  size?: 'sm' | 'base' | 'lg'
  className?: string
  background?: 'default' | 'warm' | 'gradient'
  id?: string
}

export function Section({ 
  children, 
  size = 'base', 
  className,
  background = 'default',
  id 
}: SectionProps) {
  const sizeClasses = {
    sm: classNames.sectionSm,
    base: classNames.section,
    lg: classNames.sectionLg,
  }

  const bgClasses = {
    default: 'bg-background',
    warm: 'bg-warm-white',
    gradient: 'bg-gradient-to-br from-primary/5 via-transparent to-transparent',
  }

  return (
    <section 
      id={id}
      className={cn(sizeClasses[size], bgClasses[background], className)}
    >
      {children}
    </section>
  )
}

