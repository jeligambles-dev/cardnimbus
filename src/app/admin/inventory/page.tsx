import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

function getStockBadgeVariant(stock: number): 'danger' | 'warning' | 'success' {
  if (stock <= 0) return 'danger'
  if (stock <= 5) return 'warning'
  return 'success'
}

function getStockLabel(stock: number): string {
  if (stock <= 0) return 'Out of Stock'
  if (stock <= 5) return 'Low Stock'
  return 'In Stock'
}

export default async function AdminInventoryPage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: { stock: 'asc' },
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      stock: true,
      condition: true,
    },
  })

  const lowStockCount = products.filter((p) => p.stock <= 5).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Inventory</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {products.length} active products —{' '}
          <span className={lowStockCount > 0 ? 'text-amber-400' : 'text-text-muted'}>
            {lowStockCount} low stock
          </span>
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-overlay">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Product</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Category</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Price</th>
              <th className="px-4 py-3 text-right font-medium text-text-secondary">Stock</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  No products.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className={[
                    'transition-colors',
                    product.stock <= 5
                      ? 'bg-amber-500/5 hover:bg-amber-500/10'
                      : 'hover:bg-surface-overlay/50',
                  ].join(' ')}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{product.name}</p>
                    {product.condition && (
                      <p className="text-xs text-text-muted">{product.condition}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{product.category}</td>
                  <td className="px-4 py-3 text-text-primary">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={[
                        'text-lg font-bold tabular-nums',
                        product.stock <= 0
                          ? 'text-red-400'
                          : product.stock <= 5
                          ? 'text-amber-400'
                          : 'text-text-primary',
                      ].join(' ')}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStockBadgeVariant(product.stock)}>
                      {getStockLabel(product.stock)}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
