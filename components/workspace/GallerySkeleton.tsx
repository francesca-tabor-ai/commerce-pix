import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

interface GallerySkeletonProps {
  count?: number
}

export function GallerySkeleton({ count = 6 }: GallerySkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-0">
            {/* Image skeleton */}
            <Skeleton className="aspect-square w-full" />
            
            {/* Details skeleton */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" /> {/* Badge */}
                <Skeleton className="h-4 w-20" /> {/* Time */}
              </div>
              
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" /> {/* Download button */}
                <Skeleton className="h-9 w-32" /> {/* Variation button */}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function OutputsGallerySkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Tabs skeleton */}
      <div className="flex gap-2 border-b">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
      
      {/* Gallery skeleton */}
      <GallerySkeleton count={count} />
    </div>
  )
}

export function DashboardGallerySkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="group relative overflow-hidden rounded-lg border bg-card">
          {/* Image skeleton */}
          <Skeleton className="aspect-square w-full" />
          
          {/* Hover details skeleton */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

