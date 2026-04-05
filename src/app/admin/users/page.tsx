import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-guard'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { countryByCode } from '@/lib/countries'
import { ResetPasswordButton } from '@/components/admin/reset-password-button'
import { Role } from '@prisma/client'

export const metadata = {
  title: 'Users — Admin',
}

interface UsersPageProps {
  searchParams: Promise<{ page?: string; role?: string; q?: string }>
}

function roleBadge(role: Role) {
  if (role === 'ADMIN')
    return <Badge variant="danger" size="sm">Admin</Badge>
  if (role === 'SELLER')
    return <Badge variant="success" size="sm">Seller</Badge>
  return <Badge variant="default" size="sm">Buyer</Badge>
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  await requireAdmin()
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const limit = 50
  const skip = (page - 1) * limit
  const q = params.q?.trim() ?? ''
  const roleFilter =
    params.role === 'ADMIN' || params.role === 'SELLER' || params.role === 'BUYER'
      ? (params.role as Role)
      : undefined

  const where = {
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: 'insensitive' as const } },
            { name: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [users, total, counts] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        country: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.user.count({ where }),
    db.user.groupBy({ by: ['role'], _count: true }),
  ])

  const roleCounts = counts.reduce(
    (acc, c) => {
      acc[c.role] = c._count
      return acc
    },
    {} as Record<Role, number>
  )

  const totalPages = Math.ceil(total / limit)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Users</h1>
            <p className="text-sm text-text-muted mt-1">
              {total.toLocaleString()} total — {roleCounts.BUYER ?? 0} buyers,{' '}
              {roleCounts.SELLER ?? 0} sellers, {roleCounts.ADMIN ?? 0} admins
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-surface-border bg-white p-4 mb-6">
          <form className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-xs font-semibold text-text-muted mb-1">Search</label>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Email or name"
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Role</label>
              <select
                name="role"
                defaultValue={roleFilter ?? ''}
                className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm"
              >
                <option value="">All roles</option>
                <option value="BUYER">Buyer</option>
                <option value="SELLER">Seller</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-nimbus-500 px-4 py-2 text-sm font-semibold text-white hover:bg-nimbus-600 transition-colors"
            >
              Apply
            </button>
          </form>
        </div>

        {/* Users table */}
        <div className="rounded-xl border border-surface-border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-overlay text-text-muted text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold">User</th>
                <th className="text-left px-4 py-3 font-semibold">Role</th>
                <th className="text-left px-4 py-3 font-semibold">Country</th>
                <th className="text-left px-4 py-3 font-semibold">Orders</th>
                <th className="text-left px-4 py-3 font-semibold">Joined</th>
                <th className="text-left px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((u) => {
                const country = u.country ? countryByCode(u.country) : null
                return (
                  <tr key={u.id} className="border-t border-surface-border hover:bg-surface-overlay">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-nimbus-500 text-white font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                          {u.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            (u.name ?? u.email).charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary truncate">
                            {u.name ?? '—'}
                          </p>
                          <p className="text-xs text-text-muted truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{roleBadge(u.role)}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {country ? country.name : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{u._count.orders}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <ResetPasswordButton userId={u.id} userEmail={u.email} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <p className="text-text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/users?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}${roleFilter ? `&role=${roleFilter}` : ''}`}
                  className="rounded-lg border border-surface-border bg-white px-3 py-1.5 hover:bg-surface-overlay"
                >
                  ← Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/users?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}${roleFilter ? `&role=${roleFilter}` : ''}`}
                  className="rounded-lg border border-surface-border bg-white px-3 py-1.5 hover:bg-surface-overlay"
                >
                  Next →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
