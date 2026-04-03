import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { errorResponse, UnauthorizedError, ValidationError } from '@/lib/errors'
import { slugify } from '@/lib/utils'
import { ProductCategory, CardCondition } from '@prisma/client'

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

    const [products, total] = await Promise.all([
      db.product.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count(),
    ])

    return Response.json({ products, total, page, limit })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession()

    const body = await request.json()
    const { name, category, price, stock, description, condition, images, isActive } = body

    if (!name || typeof name !== 'string') {
      throw new ValidationError('Name is required')
    }
    if (!category || !(category in ProductCategory)) {
      throw new ValidationError('Valid category is required')
    }
    if (typeof price !== 'number' || price < 0) {
      throw new ValidationError('Valid price is required')
    }
    if (condition !== undefined && condition !== null && !(condition in CardCondition)) {
      throw new ValidationError('Invalid condition')
    }

    let slug = slugify(name)
    const existing = await db.product.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const product = await db.product.create({
      data: {
        name: name.trim(),
        slug,
        category: category as ProductCategory,
        price,
        stock: typeof stock === 'number' ? stock : 0,
        description: description ?? null,
        condition: (condition as CardCondition | null) ?? null,
        images: Array.isArray(images) ? images : [],
        isActive: isActive !== false,
      },
    })

    await logAudit({
      actorType: 'ADMIN',
      actorId: (session.user as { id?: string }).id,
      action: 'product.create',
      targetType: 'Product',
      targetId: product.id,
      details: { name: product.name },
    })

    return Response.json(product, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
