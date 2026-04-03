import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { errorResponse, UnauthorizedError, ValidationError } from '@/lib/errors'
import { CouponType } from '@prisma/client'

async function requireAdminSession() {
  const session = await auth()
  if (!session?.user) throw new UnauthorizedError()
  if ((session.user as { role?: string }).role !== 'ADMIN') throw new UnauthorizedError('Forbidden')
  return session
}

export async function GET() {
  try {
    await requireAdminSession()

    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { redemptions: true } } },
    })

    return Response.json({ coupons })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession()

    const body = await request.json()
    const { code, type, value, usageLimit } = body

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      throw new ValidationError('Code is required')
    }
    if (!type || !(type in CouponType)) {
      throw new ValidationError('Valid type is required (PERCENTAGE or FIXED)')
    }
    if (typeof value !== 'number' || value <= 0) {
      throw new ValidationError('Value must be a positive number')
    }
    if (type === 'PERCENTAGE' && value > 100) {
      throw new ValidationError('Percentage value cannot exceed 100')
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type: type as CouponType,
        value,
        usageLimit: usageLimit != null ? Number(usageLimit) : null,
      },
    })

    await logAudit({
      actorType: 'ADMIN',
      actorId: (session.user as { id?: string }).id,
      action: 'coupon.create',
      targetType: 'Coupon',
      targetId: coupon.id,
      details: { code: coupon.code, type: coupon.type, value: coupon.value },
    })

    return Response.json(coupon, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
