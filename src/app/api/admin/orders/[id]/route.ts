import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { errorResponse, UnauthorizedError, NotFoundError, ValidationError } from '@/lib/errors'
import { OrderStatus } from '@prisma/client'

async function requireAdminSession() {
  const session = await auth()
  if (!session?.user) throw new UnauthorizedError()
  if ((session.user as { role?: string }).role !== 'ADMIN') throw new UnauthorizedError('Forbidden')
  return session
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession()
    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        items: true,
        payments: true,
        shipments: true,
      },
    })
    if (!order) throw new NotFoundError('Order')

    return Response.json(order)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession()
    const { id } = await params

    const existing = await db.order.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Order')

    const body = await request.json()
    const { status } = body

    if (!status || !(status in OrderStatus)) {
      throw new ValidationError('Valid status is required')
    }

    const order = await db.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    })

    await logAudit({
      actorType: 'ADMIN',
      actorId: (session.user as { id?: string }).id,
      action: 'order.status_update',
      targetType: 'Order',
      targetId: order.id,
      details: { from: existing.status, to: status },
    })

    return Response.json(order)
  } catch (error) {
    return errorResponse(error)
  }
}
