import { type NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSignupCoupon } from '@/services/coupon.service'
import { sendWelcomeEmail } from '@/lib/email'
import { errorResponse, ValidationError } from '@/lib/errors'
import { countryByCode } from '@/lib/countries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, country } = body ?? {}

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Name is required')
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new ValidationError('A valid email address is required')
    }
    if (!password || typeof password !== 'string' || password.length < 12) {
      throw new ValidationError('Password must be at least 12 characters')
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedCountry =
      country && typeof country === 'string' && countryByCode(country)
        ? country
        : null

    // Check for existing user
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      throw new ValidationError('An account with that email already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        country: normalizedCountry,
      },
    })

    // Create signup coupon (non-blocking — don't fail registration if this throws)
    let couponCode: string | null = null
    try {
      const coupon = await createSignupCoupon(user.id)
      couponCode = coupon.code
    } catch (err) {
      console.error('[register] createSignupCoupon failed:', err)
    }

    // Send welcome email (fire-and-forget)
    sendWelcomeEmail(user.email, {
      name: user.name ?? 'there',
      couponCode: couponCode ?? '',
    }).catch((err) => console.error('[register] sendWelcomeEmail failed:', err))

    return Response.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[register] error:', error)
    return errorResponse(error)
  }
}
