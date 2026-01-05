import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { ReactNode } from 'react'

interface CTAButtonProps extends Omit<ButtonProps, 'size'> {
  showArrow?: boolean
  children: ReactNode
}

export function CTAButton({ 
  children, 
  showArrow = false,
  className,
  ...props 
}: CTAButtonProps) {
  return (
    <Button
      size="lg"
      className={cn(
        'h-14 px-8 text-base font-semibold shadow-gold hover:shadow-soft-lg transition-all duration-200 hover:-translate-y-px',
        className
      )}
      {...props}
    >
      {children}
      {showArrow && <ArrowRight className="ml-2 h-5 w-5" />}
    </Button>
  )
}

