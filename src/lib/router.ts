import { useEffect, useState } from 'react'

export const PAGES = ['home', 'industry', 'framework', 'case-study', 'diagnostic', 'simulation', 'about'] as const
export type PageId = (typeof PAGES)[number]

const read = (): PageId => {
  const h = window.location.hash.replace(/^#\/?/, '')
  return (PAGES as readonly string[]).includes(h) ? (h as PageId) : 'home'
}

/** Hash routing, so every original `#page` link keeps working. */
export function useRoute(): PageId {
  const [page, setPage] = useState<PageId>(read)
  useEffect(() => {
    const on = () => setPage(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return page
}
