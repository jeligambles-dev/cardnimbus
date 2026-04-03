import { requireAdmin } from '@/lib/auth-guard'
import { AdminSidebar } from '@/components/layout/admin-sidebar'

export const metadata = {
  title: 'Admin — Card Nimbus',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-surface p-6">
        {children}
      </div>
    </div>
  )
}
