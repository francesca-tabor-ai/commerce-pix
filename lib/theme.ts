/**
 * Commerce Pix Design System
 * Theme configuration and utility classes
 */

// Spacing scale (base 4px)
export const spacing = {
  xs: 'var(--space-xs, 0.25rem)',    // 4px
  sm: 'var(--space-sm, 0.5rem)',     // 8px
  md: 'var(--space-md, 0.75rem)',    // 12px
  base: 'var(--space-base, 1rem)',   // 16px
  lg: 'var(--space-lg, 1.5rem)',     // 24px
  xl: 'var(--space-xl, 2rem)',       // 32px
  '2xl': 'var(--space-2xl, 3rem)',   // 48px
  '3xl': 'var(--space-3xl, 4rem)',   // 64px
} as const

// Container max widths
export const containerWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Common className patterns
export const classNames = {
  // Containers
  container: 'container mx-auto px-6',
  containerSm: 'max-w-3xl mx-auto px-6',
  containerMd: 'max-w-4xl mx-auto px-6',
  containerLg: 'max-w-5xl mx-auto px-6',
  containerXl: 'max-w-6xl mx-auto px-6',
  
  // Sections
  section: 'py-20 md:py-32',
  sectionSm: 'py-12 md:py-20',
  sectionLg: 'py-32 md:py-40',
  
  // Cards
  card: 'rounded-lg border border-border bg-card text-card-foreground shadow-soft',
  cardHover: 'rounded-lg border border-border bg-card text-card-foreground shadow-soft hover:shadow-soft-lg transition-all duration-200',
  cardGlass: 'glass rounded-lg',
  
  // Text
  heading1: 'text-3xl md:text-4xl font-bold tracking-tight',
  heading2: 'text-2xl md:text-3xl font-bold tracking-tight',
  heading3: 'text-xl md:text-2xl font-semibold',
  heading4: 'text-lg font-semibold',
  body: 'text-base text-foreground',
  bodyLarge: 'text-lg text-foreground',
  bodySmall: 'text-sm text-muted-foreground',
  
  // Buttons
  button: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  buttonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  buttonSecondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  buttonOutline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  buttonGhost: 'hover:bg-accent hover:text-accent-foreground',
  
  // Layouts
  flex: 'flex',
  flexCol: 'flex flex-col',
  flexCenter: 'flex items-center justify-center',
  grid: 'grid',
  gridCols2: 'grid grid-cols-1 md:grid-cols-2',
  gridCols3: 'grid grid-cols-1 md:grid-cols-3',
  gridCols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  
  // Spacing
  spaceY4: 'space-y-4',
  spaceY6: 'space-y-6',
  spaceY8: 'space-y-8',
  gap4: 'gap-4',
  gap6: 'gap-6',
  gap8: 'gap-8',
  
  // Common patterns
  sticky: 'sticky top-0 z-50',
  fixed: 'fixed inset-0 z-50',
  backdrop: 'fixed inset-0 bg-black/50 backdrop-blur-sm',
  
  // Transitions
  transitionFast: 'transition-all duration-100 ease-out',
  transitionBase: 'transition-all duration-150 ease-out',
  transitionSlow: 'transition-all duration-200 ease-out',
  
  // Shadows
  shadowSoft: 'shadow-soft',
  shadowSoftMd: 'shadow-soft-md',
  shadowSoftLg: 'shadow-soft-lg',
  shadowGold: 'shadow-gold',
} as const

// Utility function to combine classNames
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Animation variants
export const animations = {
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-150',
  slideInFromBottom: 'animate-in slide-in-from-bottom-4 duration-200',
  slideInFromTop: 'animate-in slide-in-from-top-4 duration-200',
  slideInFromRight: 'animate-in slide-in-from-right-4 duration-200',
  slideInFromLeft: 'animate-in slide-in-from-left-4 duration-200',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-150',
} as const

// Responsive breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const

