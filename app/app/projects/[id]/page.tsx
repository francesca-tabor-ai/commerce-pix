import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Upload, Wand2 } from 'lucide-react'
import { requireUser } from '@/lib/supabase/server'
import { getProject } from '@/lib/db/projects'
import { getAssetsByProject } from '@/lib/db/assets'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await requireUser()
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  const assets = await getAssetsByProject(params.id)
  const inputAssets = assets?.filter(a => a.kind === 'input') || []
  const outputAssets = assets?.filter(a => a.kind === 'output') || []

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <Link href="/app/projects">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1">
              Created {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/app">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </Link>
            <Link href="/app">
              <Button>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardDescription>Input Images</CardDescription>
            <CardTitle className="text-4xl">{inputAssets.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Generated Images</CardDescription>
            <CardTitle className="text-4xl">{outputAssets.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Assets</CardDescription>
            <CardTitle className="text-4xl">{assets?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Assets Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Assets</h2>
        
        {assets && assets.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    {asset.kind === 'input' ? '📤' : '✨'}
                  </span>
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium truncate">
                    {asset.mode || 'Input'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center">
                No assets in this project yet.<br />
                Upload an image to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

