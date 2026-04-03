import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { errorResponse, UnauthorizedError, NotFoundError, ValidationError } from '@/lib/errors'
import { ProductCategory, CardCondition } from '@prisma/client'

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

    const product = await db.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundError('Product')

    return Response.json(product)
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

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Product')

    const body = await request.json()
    const { name, category, price, stock, description, condition, images, isActive } = body

    if (category !== undefined && !(category in ProductCategory)) {
      throw new ValidationError('Invalid category')
    }
    if (condition !== undefined && condition !== null && !(condition in CardCondition)) {
      throw new ValidationError('Invalid condition')
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(category !== undefined && { category: category as ProductCategory }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(Object.prototype.hasOwnProperty.call(body, 'description') && { description: description ?? null }),
        ...(Object.prototype.hasOwnProperty.call(body, 'condition') && { condition: (condition as CardCondition | null) ?? null }),
        ...(Array.isArray(images) && { images }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })

    await logAudit({
      actorType: 'ADMIN',
      actorId: (session.user as { id?: string }).id,
      action: 'product.update',
      targetType: 'Product',
      targetId: product.id,
      details: { name: product.name },
    })

    return Response.json(product)
  } catch (error) {
    return errorResponse(error)
  }
}
