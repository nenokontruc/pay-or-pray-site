// About (legacy/index.html:1084-1145). Text is verbatim from the original page.
import { useState } from 'react'
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
      {ok && <img className="headshot" src={`${import.meta.env.BASE_URL}headshot.jpg`} alt="Portrait of Trúc Trinh" onError={() => setOk(false)} />}
    </div>
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
              <p><em>Trúc Trinh</em> (Truc Anh Nha Trinh) is a graduate student in Logistics, Materials, and Supply Chain Management at <em>Saint Louis University</em>, where this project was completed for <em>OPM 6600 &mdash; Pricing and Revenue Optimization</em>. She holds a Bachelor of Business Administration in Marketing from <em>Western Sydney University Vietnam</em>.</p>
              <p>Before graduate school, she spent two years at <em>VNG Corporation</em> as a Game Operation Collaborator, working on live operations and localization for <em>Revelation: New World</em> and <em>Dream &amp; Lethe Record</em>. She led Chinese-to-Vietnamese and English localization, tested patches, and coordinated with regional teams across the Philippines, Indonesia, Singapore and Thailand to ship updates on schedule &mdash; including the Vietnam Gameverse 2023 launch and a one-year anniversary event &mdash; and contributed English localization for <em>Ghost Story</em>.</p>
              <p>This project grew out of that work. Running events and adapting games for different countries raised the questions it tries to answer: why the same item needs a different price in each market, and why some ways of selling build trust while others burn it.</p>

              <h3 className="about-h3">From experience to analysis</h3>
              <div className="link-grid">
                <a className="link-card" href="#industry"><b>Localization across Southeast Asia</b><span>&rarr; the out-of-game economy and regional price ladders on the Industry page</span></a>
                <a className="link-card" href="#simulation"><b>Live operations &amp; events</b><span>&rarr; the LiveOps dashboard and event mechanics in the Simulation</span></a>
                <a className="link-card" href="#simulation"><b>Patch testing</b><span>&rarr; the pre-launch test lab: closed beta, survey, A/B test</span></a>
              </div>

              <h3 className="about-h3">Path</h3>
              <ol className="timeline">
                <li><span className="tl-y">2019&ndash;2023</span><b>B.B.A., Marketing</b> &middot; Western Sydney University Vietnam</li>
                <li><span className="tl-y">2023&ndash;2025</span><b>Game Operation Collaborator</b> &middot; VNG Corporation, Vietnam</li>
                <li><span className="tl-y">2025&ndash;now</span><b>M.S., Supply Chain Management</b> &middot; Saint Louis University</li>
              </ol>

              <div className="ab-thanks">
                <p className="game-note"><b>Acknowledgments.</b> Thanks to a former manager and monetization specialist (anonymized) for the industry interview behind much of this analysis, to guest speaker Dr. Tim Smith of Wiglaf Pricing, and to the OPM 6600 instructor for guidance and access to the course&rsquo;s research database.</p>
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
