'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/select'

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'PACK', label: 'Pack' },
  { value: 'BOOSTER_BOX', label: 'Booster Box' },
  { value: 'SLAB', label: 'Slab' },
  { value: 'SINGLE', label: 'Single' },
]

const conditionOptions = [
  { value: '', label: 'Any Condition' },
  { value: 'NM', label: 'NM' },
  { value: 'LP', label: 'LP' },
  { value: 'MP', label: 'MP' },
  { value: 'HP', label: 'HP' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name' },
]

interface ProductFiltersProps {
  category?: string
  condition?: string
  sortBy?: string
}

export function ProductFilters({
  category = '',
  condition = '',
  sortBy = 'newest',
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to page 1 when filters change
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Select
        options={categoryOptions}
        value={category}
        onChange={(e) => updateParam('category', e.target.value)}
        aria-label="Category"
        className="sm:w-44"
      />
      <Select
        options={conditionOptions}
        value={condition}
        onChange={(e) => updateParam('condition', e.target.value)}
        aria-label="Condition"
        className="sm:w-44"
      />
      <Select
        options={sortOptions}
        value={sortBy}
        onChange={(e) => updateParam('sortBy', e.target.value)}
        aria-label="Sort by"
        className="sm:w-52"
      />
    </div>
  )
}
