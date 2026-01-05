import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabase/server'
import { getAssetsByProject } from '@/lib/db/assets'

export const dynamic = 'force-dynamic'

/**
 * GET /api/projects/[id]/outputs
 * Fetch output assets for a specific project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireUser()

    const projectId = params.id
    const assets = await getAssetsByProject(projectId)
    
    // Filter for output assets only
    const outputs = assets?.filter(a => a.kind === 'output') || []

    return NextResponse.json({ outputs })
  } catch (error) {
    console.error('Error fetching project outputs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outputs' },
      { status: 500 }
    )
  }
}

