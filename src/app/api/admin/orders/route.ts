import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { errorResponse, UnauthorizedError } from '@/lib/errors'
import { OrderStatus } from '@prisma/client'

async function requireAdminSession() {
  const session = await auth()
  if (!session?.user) throw new UnauthorizedError()
  if ((session.user as { role?: string }).role !== 'ADMIN') throw new UnauthorizedError('Forbidden')
  return session
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession()

    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10))
    const statusParam = searchParams.get('status')

    const status =
      statusParam && statusParam in OrderStatus
        ? (statusParam as OrderStatus)
        : undefined

    const where = status ? { status } : {}

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          items: { select: { id: true, titleSnapshot: true, quantity: true, priceAtPurchase: true } },
        },
      }),
      db.order.count({ where }),
    ])

    return Response.json({ orders, total, page, limit })
  } catch (error) {
    return errorResponse(error)
  }
}
