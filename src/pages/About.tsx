// About (legacy/index.html:1084-1145). Rewritten in the first person with capability rows at the author's request;
// every original fact is kept (docs/CONTENT_CORRECTIONS.md §3–6).
import { useState, type ReactNode } from 'react'
import { Seal } from '../components/Art'
import './about/about.css'

export const LINKEDIN_URL = 'https://www.linkedin.com/in/truc-trinh-anh-nha-253a63234/'

function Portrait() {
  // The original loads headshot.jpg and falls back to the "TT" monogram if the file is missing.
  // The repository has no headshot yet; adding public/headshot.jpg makes it appear automatically.
  const [ok, setOk] = useState(true)
  return (
    <div className="photo-frame">
      <span className="mono">TT</span>
      {ok && <img className="headshot" src={`${import.meta.env.BASE_URL}headshot.jpg`} alt="Portrait of Trúc Trịnh" onError={() => setOk(false)} />}
    </div>
  )
}

/**
 * Professional experience → the part of this research it informed. Each responsibility appears once (here),
 * not also in the biography. A link is given only where the research page models that experience;
 * regional collaboration has none, and the test-lab link refers to testing, not to patch notes.
 */
const CAPABILITIES: { name: string; did: ReactNode; link?: { href: string; lead: string; text: string } }[] = [
  { name: 'Live Operations & Events', did: 'Live operations and event coordination.',
    link: { href: '#simulation', lead: 'In this research', text: 'the LiveOps dashboard and event mechanics in the Simulation' } },
  { name: 'Localization', did: <>Chinese-to-Vietnamese and English localization, including English localization for <em>Ghost Story</em>.</>,
    link: { href: '#industry', lead: 'In this research', text: 'the out-of-game economy and regional price ladders on the Industry page' } },
  { name: 'Patch Testing & Patch-Note Delivery', did: 'Testing game updates and patches; preparing, coordinating and delivering patch notes.',
    link: { href: '#simulation', lead: 'In this research · testing only', text: 'the pre-launch test lab: closed beta, survey, A/B test' } },
  { name: 'Regional Collaboration', did: 'Communicating with regional teams across the Philippines, Indonesia, Singapore and Thailand so that updates shipped on schedule.' },
]

function CapabilityRows() {
  return (
    <ul className="ab-caps" aria-label="Professional capabilities and where they appear in this research">
      {CAPABILITIES.map((c) => (
        <li key={c.name} className="ab-cap">
          <b className="ab-cap-name">{c.name}</b>
          <span className="ab-cap-did">{c.did}</span>
          {c.link
            ? <a className="ab-cap-link" href={c.link.href}><span className="ab-cap-k">{c.link.lead}</span>&rarr; {c.link.text}</a>
            : <span className="ab-cap-link none"><span className="ab-cap-k">In this research</span>No dedicated page</span>}
        </li>
      ))}
    </ul>
  )
}

export default function About() {
  return (
    <div className="ab">
      <div className="wrap">
        <section className="block ab-block">
          <p className="kicker">About</p>
          {/* h2 in the original; promoted to the page's h1 for accessibility (same text and style). */}
          <h1 className="sec-title ab-title">Who built this</h1>

          <div className="about-grid">
            <div>
              <Portrait />
              <div className="about-meta">
                <div><span className="am-k">Program</span>M.S. Supply Chain Management, Saint Louis University</div>
                <div><span className="am-k">Background</span>Game LiveOps &amp; localization, VNG Corporation</div>
                <div><span className="am-k">Localization</span>Chinese &rarr; Vietnamese / English</div>
              </div>
            </div>
            <div className="about-copy">
              {/* First person, revised Nov 2026 at the author's request (docs/CONTENT_CORRECTIONS.md §3–6). */}
              <p>I&rsquo;m <em>Trúc Trịnh</em>, a graduate student in Logistics, Materials, and Supply Chain Management at <em>Saint Louis University</em>, where I completed this project for <em>OPM 6600 &mdash; Pricing and Revenue Optimization</em>. I hold a Bachelor of Business Administration in Marketing from <em>Western Sydney University Vietnam</em>.</p>
              <p>Before graduate school, I spent two years at <em>VNG Corporation</em> as a Game Operation Collaborator on <em>Revelation: New World</em> and <em>Dream &amp; Lethe Record</em>.</p>
              <p>My experience in game live operations and localization shaped the questions behind this research: why the same item needs a different price in each market, and why some ways of selling build trust while others burn it.</p>

              <h3 className="about-h3">What I did, and where it shows up in this research</h3>
              <CapabilityRows />
              <p className="game-note present-hide ab-secondary">Additional event contributions included support for the Vietnam Gameverse 2023 launch and a one-year anniversary event.</p>

              <h3 className="about-h3 present-hide">Path</h3>
              <ol className="timeline present-hide">
                <li><span className="tl-y">2019&ndash;2023</span><b>B.B.A., Marketing</b> &middot; Western Sydney University Vietnam</li>
                <li><span className="tl-y">2023&ndash;2025</span><b>Game Operation Collaborator</b> &middot; VNG Corporation, Vietnam</li>
                <li><span className="tl-y">2025&ndash;now</span><b>M.S., Supply Chain Management</b> &middot; Saint Louis University</li>
              </ol>

              <div className="ab-thanks">
                <p className="game-note"><b>Acknowledgments.</b> Thanks to Professor Xiao Zhang, instructor of OPM 6600 &mdash; Pricing and Revenue Optimization, for guidance and access to the course&rsquo;s research database; to guest speaker Dr. Tim Smith of Wiglaf Pricing for sharing industry insights; and to a former manager and monetization specialist (anonymized) for the industry interview behind much of this analysis.</p>
                <span className="ab-seal" aria-hidden><Seal size={56} /></span>
              </div>
              <a className="btn ab-btn" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">Connect on LinkedIn &rarr;</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
