import { type NextRequest } from 'next/server'
import { errorResponse, ValidationError } from '@/lib/errors'
import {
  getTopSellers,
  getTopRated,
  getBestPulls,
  getRaffleWinners,
} from '@/services/leaderboard.service'

const VALID_TYPES = ['sellers', 'rated', 'pulls', 'winners'] as const
type LeaderboardType = (typeof VALID_TYPES)[number]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type') as LeaderboardType | null
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 50)

    if (!type || !VALID_TYPES.includes(type)) {
      throw new ValidationError(`type must be one of: ${VALID_TYPES.join(', ')}`)
    }

    let data
    switch (type) {
      case 'sellers':
        data = await getTopSellers(limit)
        break
      case 'rated':
        data = await getTopRated(limit)
        break
      case 'pulls':
        data = await getBestPulls(limit)
        break
      case 'winners':
        data = await getRaffleWinners(limit)
        break
    }

    return Response.json({ type, data })
  } catch (error) {
    return errorResponse(error)
  }
}
