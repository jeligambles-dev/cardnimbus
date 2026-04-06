'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

interface SearchResult {
  id: string
  name: string
  slug: string | null
  subtitle?: string
  price: number
  images: string[]
  type?: 'product' | 'listing'
}

interface SearchResponse {
  hits: SearchResult[]
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 120)

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`/api/search/quick?q=${encodeURIComponent(q)}&limit=6`)
      if (res.ok) {
        const data: SearchResponse = await res.json()
        setResults(data.hits ?? [])
      }
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults(debouncedQuery)
  }, [debouncedQuery, fetchResults])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsFocused(false)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setIsFocused(false)
    setQuery('')
    if (result.type === 'listing') {
      router.push(`/marketplace/${result.id}`)
    } else {
      router.push(`/shop/${result.slug}`)
    }
  }

  const showDropdown = isFocused && results.length > 0

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search">
        <div className="relative flex items-center">
          {/* Search icon */}
          <svg
            className="pointer-events-none absolute left-3.5 h-5 w-5 text-text-muted"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search cards, sets, packs…"
            className="w-full h-11 rounded-xl border-2 border-surface-border bg-white pl-11 pr-4 text-sm font-semibold text-text-primary placeholder-text-muted placeholder:font-medium outline-none transition-all focus:border-nimbus-500 focus:ring-4 focus:ring-nimbus-500/10 focus:shadow-[0_4px_12px_-2px_rgba(255,0,0,0.15)]"
          />
          {isLoading && (
            <svg
              className="absolute right-4 h-5 w-5 animate-spin text-nimbus-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border-2 border-nimbus-500/20 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)]"
          >
            <ul>
              {results.map((result, i) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => handleResultClick(result)}
                    className={`flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-nimbus-50 ${
                      i < results.length - 1 ? 'border-b border-surface-border' : ''
                    }`}
                  >
                    {/* Image — bigger */}
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-surface-border bg-surface-overlay">
                      {result.images?.[0] ? (
                        <Image
                          src={result.images[0]}
                          alt={result.name}
                          width={64}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg className="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-text-primary line-clamp-2 leading-snug">{result.name}</p>
                      {result.subtitle && (
                        <p className="mt-1 truncate text-xs text-text-muted uppercase tracking-wider font-semibold">{result.subtitle}</p>
                      )}
                    </div>
                    {/* Price */}
                    <span className="shrink-0 text-lg font-black text-nimbus-600">
                      ${result.price.toFixed(2)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {/* View all */}
            {query.trim() && (
              <button
                type="button"
                onClick={handleSubmit as unknown as React.MouseEventHandler}
                className="flex w-full items-center justify-center gap-1.5 border-t-2 border-surface-border bg-nimbus-50 px-4 py-3 text-sm font-bold text-nimbus-600 transition-colors hover:bg-nimbus-100"
              >
                View all results for &ldquo;{query}&rdquo;
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
