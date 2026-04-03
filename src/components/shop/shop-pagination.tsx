'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Pagination } from '@/components/ui/pagination'

interface ShopPaginationProps {
  page: number
  totalPages: number
}

export function ShopPagination({ page, totalPages }: ShopPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  )
}
