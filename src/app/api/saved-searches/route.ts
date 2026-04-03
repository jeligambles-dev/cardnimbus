import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { errorResponse, UnauthorizedError, ValidationError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const body = await request.json()
    const { query, filters } = body as { query?: string; filters?: Record<string, unknown> }

    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new ValidationError('query is required')
    }

    const saved = await db.savedSearch.create({
      data: {
        userId: session.user.id,
        query: query.trim(),
        filtersJson: filters
          ? (filters as Parameters<typeof db.savedSearch.create>[0]['data']['filtersJson'])
          : undefined,
      },
    })

    return Response.json(saved, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const searches = await db.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return Response.json({ searches })
  } catch (error) {
    return errorResponse(error)
  }
}
