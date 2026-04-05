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

const gradingCompanyOptions = [
  { value: '', label: 'Any Company' },
  { value: 'PSA', label: 'PSA' },
  { value: 'BGS', label: 'BGS' },
  { value: 'ACE', label: 'ACE' },
  { value: 'CGC', label: 'CGC' },
  { value: 'TAG', label: 'TAG' },
]

const gradeOptions = (() => {
  const opts: { value: string; label: string }[] = [
    { value: '', label: 'Any Grade' },
  ]
  for (let g = 10; g >= 1; g -= 0.5) {
    opts.push({ value: g.toFixed(1), label: g.toFixed(1) + '+' })
  }
  return opts
})()

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'deal_score', label: 'Best Deal Score' },
]

interface ListingFiltersProps {
  category?: string
  condition?: string
  sortBy?: string
  minPrice?: string
  maxPrice?: string
  minGrade?: string
  gradingCompany?: string
}

export function ListingFilters({
  category = '',
  condition = '',
  sortBy = 'newest',
  minPrice = '',
  maxPrice = '',
  minGrade = '',
  gradingCompany = '',
}: ListingFiltersProps) {
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
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const isSlab = category === 'SLAB'

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <Select
        options={categoryOptions}
        value={category}
        onChange={(e) => {
          // When switching category, clear the filters that don't apply to the new category
          const params = new URLSearchParams(searchParams.toString())
          const newCategory = e.target.value
          if (newCategory) params.set('category', newCategory)
          else params.delete('category')
          if (newCategory === 'SLAB') {
            params.delete('condition')
          } else {
            params.delete('minGrade')
            params.delete('gradingCompany')
          }
          params.delete('page')
          router.push(`${pathname}?${params.toString()}`)
        }}
        aria-label="Category"
        className="sm:w-44"
      />
      {isSlab ? (
        <>
          <Select
            options={gradingCompanyOptions}
            value={gradingCompany}
            onChange={(e) => updateParam('gradingCompany', e.target.value)}
            aria-label="Grading Company"
            className="sm:w-40"
          />
          <Select
            options={gradeOptions}
            value={minGrade}
            onChange={(e) => updateParam('minGrade', e.target.value)}
            aria-label="Minimum Grade"
            className="sm:w-36"
          />
        </>
      ) : (
        <Select
          options={conditionOptions}
          value={condition}
          onChange={(e) => updateParam('condition', e.target.value)}
          aria-label="Condition"
          className="sm:w-44"
        />
      )}
      <Select
        options={sortOptions}
        value={sortBy}
        onChange={(e) => updateParam('sortBy', e.target.value)}
        aria-label="Sort by"
        className="sm:w-52"
      />
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min $"
          value={minPrice}
          onChange={(e) => updateParam('minPrice', e.target.value)}
          className="w-24 bg-surface-raised border border-surface-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20 outline-none"
          min={0}
        />
        <span className="text-text-muted text-sm">–</span>
        <input
          type="number"
          placeholder="Max $"
          value={maxPrice}
          onChange={(e) => updateParam('maxPrice', e.target.value)}
          className="w-24 bg-surface-raised border border-surface-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-nimbus-500 focus:ring-2 focus:ring-nimbus-500/20 outline-none"
          min={0}
        />
      </div>
    </div>
  )
}
