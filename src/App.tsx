import { useEffect, useState, type ReactNode } from 'react'
import Home from './pages/Home'
import Industry from './pages/Industry'
import Coming from './pages/Coming'
import Simulation from './pages/Simulation'
import CaseStudy from './pages/CaseStudy'
import Diagnostic from './pages/Diagnostic'
import About from './pages/About'
import Framework from './pages/Framework'
import { FRAMEWORK_REFERENCES } from './data/framework'
import { CASE_FOOTER_META, CASE_REFERENCES } from './data/caseStudy'
import { DIAGNOSTIC_REFERENCES } from './data/diagnostic'
import { SimulationProvider } from './pages/simulation/controller'
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

/** "How this simulation works" footer, verbatim from legacy/index.html:1065-1081. */
function SimulationFooter() {
  return (
    <footer>
      <div className="wrap-wide">
        <div className="foot-grid">
          <div>
            <h5>How this simulation works</h5>
            <div className="refs">
              <div>A panel of simulated monthly active players (1,000 at launch, each representing 200 real players &mdash; established players, not raw installs). Most of them (72&ndash;82%, depending on market) never spend at any price, matching the freemium pattern that most players don&rsquo;t pay; each with a persistent spending segment, daily engagement rate and a monthly budget that all packages share. Each month is simulated day by day. Players churn more when goodwill falls below 60; new installs arrive faster when goodwill is high. A player buys the highest price tier they can afford; gacha players pull until they win or hit the 50-pull pity, limited by budget.</div>
              <div>Offering more than 6 tiers in one ladder slightly lowers conversion (choice overload; directionally after Iyengar &amp; Lepper, 2000). Survey answers are inflated ~1.35&times; to reflect hypothetical bias in stated willingness to pay (Murphy et al., 2005).</div>
              <div>Goodwill dynamics reflect Petrovskaya &amp; Zendle (2022) and the diagnostic framework on this site. Market differences: Sensor Tower Japan Game Market Insights (2025); Moloco (2025); Xsolla (2025); CNBC / Newzoo (2018); industry interview (2026).</div>
            </div>
          </div>
          <div className="meta"><p>All in-game numbers are illustrative calibrations, not measured market data. This site accompanies a written report covering the full analysis, citations, and methodology.</p></div>
        </div>
      </div>
    </footer>
  )
}

const DEFAULT_META = 'This site accompanies a written report covering the full analysis, citations, and methodology behind the framework presented here.'

/** Page footer with "Select references" (original per-page footers, legacy/index.html). */
function RefFooter({ refs, meta = DEFAULT_META }: { refs: ReactNode[]; meta?: ReactNode }) {
  return (
    <footer>
      <div className="wrap-wide">
        <div className="foot-grid">
          <div>
            <h5>Select references</h5>
            <div className="refs notranslate" translate="no">{refs.map((r, i) => <div key={i}>{r}</div>)}</div>
          </div>
          <div className="meta"><p>{meta}</p></div>
        </div>
      </div>
    </footer>
  )
}

function Footer({ page }: { page: PageId }) {
  if (page === 'simulation') return <SimulationFooter />
  if (page === 'case-study') return <RefFooter refs={CASE_REFERENCES} meta={CASE_FOOTER_META} />
  if (page === 'diagnostic') return <RefFooter refs={DIAGNOSTIC_REFERENCES} />
  if (page === 'framework') return <RefFooter refs={FRAMEWORK_REFERENCES} />
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

/** `simulationSeed` is for tests only; the live site seeds from the clock like the original. */
export default function App({ simulationSeed }: { simulationSeed?: number } = {}) {
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
    <SimulationProvider seed={simulationSeed}>
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
        {page === 'home' ? <Home />
          : page === 'industry' ? <Industry />
          : page === 'framework' ? <Framework />
          : page === 'case-study' ? <CaseStudy />
          : page === 'diagnostic' ? <Diagnostic />
          : page === 'simulation' ? <Simulation />
          : page === 'about' ? <About />
          : <Coming page={page} />}
        <PageNav page={page} />
      </main>
      <Footer page={page} />
    </SimulationProvider>
  )
}
