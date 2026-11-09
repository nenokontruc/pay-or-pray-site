import type { ReactNode } from 'react'

/** Native <details> disclosure: keyboard- and screen-reader-accessible, no JS state to desync. */
export function Disclosure({ label, children, defaultOpen = false, className = '' }: { label: string; children: ReactNode; defaultOpen?: boolean; className?: string }) {
  return (
    <details className={`disclosure ${className}`} open={defaultOpen}>
      <summary><span className="chev" aria-hidden />{label}</summary>
      <div className="disclosure-body">{children}</div>
    </details>
  )
}

export function Takeaway({ children }: { children: ReactNode }) {
  return (
    <div className="takeaway">
      <span className="takeaway-tag">Takeaway</span>
      <p>{children}</p>
    </div>
  )
}

export function SlideHead({ n, title, lede }: { n: string; title: string; lede: string }) {
  return (
    <header className="slide-head">
      <span className="slide-n" aria-hidden>{n}</span>
      <h2 className="sec-title">{title}</h2>
      <p className="sec-lede">{lede}</p>
    </header>
  )
}
