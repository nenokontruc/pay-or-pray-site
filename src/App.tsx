import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Industry from './pages/Industry'
import Coming from './pages/Coming'
import { LangSwitch } from './components/LangSwitch'
import { PAGES, useRoute, type PageId } from './lib/router'

const LABEL: Record<PageId, string> = { home: 'Home', industry: 'Industry', framework: 'Framework', 'case-study': 'Case Study', diagnostic: 'Diagnostic', simulation: 'Simulation', about: 'About' }

function PageNav({ page }: { page: PageId }) {
  const i = PAGES.indexOf(page)
  const prev = PAGES[i - 1], next = PAGES[i + 1]
  return (
    <nav className="pager wrap-wide" aria-label="Previous and next page">
      {prev ? <a href={`#${prev}`} className="pager-a prev"><span>Previous</span><b>← {LABEL[prev]}</b></a> : <span />}
      {next ? <a href={`#${next}`} className="pager-a next"><span>Next</span><b>{LABEL[next]} →</b></a> : <span />}
    </nav>
  )
}

function Footer({ page }: { page: PageId }) {
  const industry = page === 'industry'
  return (
    <footer>
      <div className="wrap-wide">
        <div className="foot-grid">
          <div>
            <h5>{industry ? 'Select references' : 'About this project'}</h5>
            <div className="refs notranslate" translate="no">
              {industry ? (
                <>
                  <div>Newzoo (2025). Global Games Market Report 2025. Sensor Tower (2026). State of Mobile 2026.</div>
                  <div>Chen, N., Elmachtoub, A., Hamilton, M., &amp; Lei, X. (2021). Loot Box Pricing and Design. <i>Management Science.</i></div>
                  <div>Harutyunyan, M., &amp; Koca, E. (2025). Pricing and Design of Pay-to-Win Add-Ons. <i>Management Science.</i></div>
                  <div>Industry interview with an anonymized monetization specialist (former manager, name withheld). Personal communication, September 2026.</div>
                </>
              ) : (
                <>
                  <div>OPM 6600 — Pricing and Revenue Optimization</div>
                  <div>Final project companion site · Trúc Trinh</div>
                </>
              )}
            </div>
          </div>
          <div className="meta"><p>This site accompanies a written report covering the full analysis, citations, and methodology behind the framework presented here.</p></div>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const page = useRoute()
  const [present, setPresent] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [page])
  useEffect(() => { window.scrollTo(0, 0) }, [page])
  useEffect(() => {
    document.documentElement.classList.toggle('present', present)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setPresent(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [present])

  return (
    <>
      <div id="progress-bar"><div id="progress-fill" style={{ width: `${progress}%` }} /></div>
      <header className="nav">
        <div className="nav-inner">
          <div className="brand notranslate" translate="no">pay<span> or pray</span></div>
          <nav className="links" aria-label="Primary">
            {PAGES.map((id) => (
              <a key={id} href={`#${id}`} className={id === page ? 'active' : ''} aria-current={id === page ? 'page' : undefined}>{LABEL[id]}</a>
            ))}
          </nav>
          <div className="nav-tools">
            <button type="button" className={`present-btn ${present ? 'on' : ''}`} aria-pressed={present} onClick={() => setPresent(!present)} title="Presentation mode (Esc to exit)">
              {present ? 'Exit' : 'Present'}
            </button>
            <LangSwitch />
          </div>
        </div>
      </header>
      <main id="main" key={page} className="page-enter">
        {page === 'home' ? <Home /> : page === 'industry' ? <Industry /> : <Coming page={page} />}
        <PageNav page={page} />
      </main>
      <Footer page={page} />
    </>
  )
}
