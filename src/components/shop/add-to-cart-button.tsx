'use client'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'
import { toast } from '@/components/ui/toast'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    slug: string
    images: string[]
    price: number
    stock: number
  }
  className?: string
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const soldOut = product.stock === 0

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] ?? null,
      price: product.price,
      quantity: 1,
    })
    toast(`${product.name} added to cart`, 'success')
  }

  return (
    <Button
      variant="primary"
      size="lg"
      disabled={soldOut}
      onClick={soldOut ? undefined : handleAdd}
      className={className}
    >
      {soldOut ? 'Sold Out' : 'Add to Cart'}
    </Button>
  )
}
