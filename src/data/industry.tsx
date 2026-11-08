import type { ReactNode } from 'react'

/* ---------- Market overview (Newzoo 2025; Sensor Tower 2025) ---------- */
export const MARKET = {
  year: 2025,
  total: 188.8,
  mobile: 103,
  mobileShareLabel: 55,
  otherShareLabel: 45,
  spendNothingPct: 56,
  source: 'Newzoo',
}
export const IAP_GROWTH = {
  year: 2025,
  mobileGamesPct: 1.3,
  nonGameAppsPct: 21,
  mobileGamesIapApproxB: 82,
  source: 'Sensor Tower',
}

/* ---------- History: every original milestone ---------- */
export type Era = 'e1' | 'e2' | 'e3'
export type Milestone = { year: string; short: string; icon: string; era: Era; title: string; body: ReactNode; lesson: ReactNode }
export const ERAS: Record<Era, string> = { e1: 'Origins of the model', e2: 'Mobile scale', e3: 'Regulation & maturity' }
export const HISTORY: Milestone[] = [
  { year: '1980s', short: 'Shareware', icon: 'floppy', era: 'e1', title: 'Software is given away to sell the upgrade',
    body: <>Shareware programs spread for free and asked users to pay for the full version. The model existed decades before it had a name.</>,
    lesson: <>Pricing lesson: free is a distribution strategy, not a price.</> },
  { year: '1999', short: 'Free-to-play', icon: 'pad', era: 'e1', title: 'Games go free-to-play',
    body: <>Nexon’s <i>QuizQuiz</i> in South Korea became one of the first online games to be free to play and earn from selling in-game items.</>,
    lesson: <>Pricing lesson: revenue shifts from one sale per player to many small sales to a few players.</> },
  { year: '2006', short: 'Named “freemium”', icon: 'bubble', era: 'e1', title: 'The model gets its name',
    body: <>Venture capitalist Fred Wilson described giving a service away and charging for premium features, and asked readers to name it. Jarid Lukin of Alacra suggested “freemium.”</>,
    lesson: <>Pricing lesson: the free tier is the customer-acquisition engine.</> },
  { year: '2009', short: 'In-app purchases', icon: 'phone', era: 'e2', title: 'Apple lets free apps sell inside the app',
    body: <>In October 2009, Apple allowed in-app purchases in free iPhone apps, which had previously been limited to paid apps — opening mobile to the free-to-play model.</>,
    lesson: <>Pricing lesson: the price ladder moves inside the game, and platform price tiers start to shape it.</> },
  { year: '2012', short: 'Japan: complete gacha', icon: 'capsule', era: 'e3', title: 'Japan bans one gacha design',
    body: <>Japan’s Consumer Affairs Agency moved against “complete gacha” — draws that reward collecting a full random set — while ordinary gacha stayed legal.</>,
    lesson: <>Pricing lesson: regulators judge <i>how</i> a lucky draw is designed, not just whether one exists.</> },
  { year: '2015', short: 'Honor of Kings', icon: 'crown', era: 'e2', title: 'Honor of Kings launches',
    body: <>Tencent’s MOBA, monetized through skins, grows into China’s highest-grossing mobile game — this project’s first case.</>,
    lesson: <>Pricing lesson: cosmetic-first selling can work at enormous scale.</> },
  { year: '2017–18', short: 'Disclosure & backlash', icon: 'gavel', era: 'e3', title: 'Disclosure and backlash',
    body: <>China required games to publish drop rates (2017). After the <i>Star Wars Battlefront II</i> controversy, Belgium declared paid loot boxes illegal gambling in April 2018.</>,
    lesson: <>Pricing lesson: probability becomes a disclosed — and legally risky — part of the price.</> },
  { year: '2024–25', short: 'A maturing market', icon: 'chart', era: 'e3', title: 'A maturing market',
    body: <>Where Winds Meet launches in China (December 2024) with a cosmetic-only gacha. In 2025, non-game apps out-earn games in in-app purchases for the first time.</>,
    lesson: <>Pricing lesson: growth now comes from smarter design and localization, not from more players.</> },
]
export const HISTORY_SOURCES = 'Colors mark the theme of each milestone. Sources: Wilson / Lukin via StartupNation and EBSCO; Free-to-play history (Nexon); Mobile Marketing Magazine & Daring Fireball (2009); DiGRA paper on gacha in Japan; Game Informer (2018); Sensor Tower (2026); KeenGamer (2025).'

/* ---------- Seven monetization models ---------- */
export type Kind = 'Deterministic' | 'Either' | 'Probabilistic'
export type Model = { id: string; label: string; icon: string; kind: Kind; how: string; example: string; cite?: string }
export const MODELS: Model[] = [
  { id: 'direct', label: 'Direct Purchase', icon: 'cart', kind: 'Deterministic',
    how: "A known item at a known price — the oldest, simplest freemium mechanic, and the core of both case-study games' shops.",
    example: 'Honor of Kings skin shop' },
  { id: 'currency', label: 'Virtual Currency', icon: 'gem', kind: 'Either',
    how: 'Real money converts to an in-game currency, adding psychological distance between payment and spend.',
    example: 'Source: Guo, Hao, Mukhopadhyay & Sun, ISR 2019', cite: 'Guo, Hao, Mukhopadhyay & Sun, ISR 2019' },
  { id: 'pass', label: 'Subscription / Battle Pass', icon: 'calendar', kind: 'Deterministic',
    how: 'A fixed recurring price for a defined, known set of benefits over a season.',
    example: 'Source: Mai & Hu, Mgmt. Sci. 2023', cite: 'Mai & Hu, Mgmt. Sci. 2023' },
  { id: 'loot', label: 'Loot Box / Gacha', icon: 'capsule', kind: 'Probabilistic',
    how: 'Pay for a chance, not a thing. Value is resolved by probability after the transaction completes.',
    example: 'Honor of Kings and Where Winds Meet both run lucky draws (see Case Study). Source: Chen, Elmachtoub, Hamilton & Lei, Mgmt. Sci. 2021', cite: 'Chen, Elmachtoub, Hamilton & Lei, Mgmt. Sci. 2021' },
  { id: 'p2w', label: 'Pay-to-Win Add-ons', icon: 'swords', kind: 'Deterministic',
    how: 'Direct purchase of competitive power. Value is driven by network effects — worth more to an owner the more opponents lack it — which is exactly what makes it tempting despite the fairness risk.',
    example: 'Source: Harutyunyan & Koca, Management Science 2025', cite: 'Harutyunyan & Koca, Management Science 2025' },
  { id: 'ads', label: 'Advertising', icon: 'megaphone', kind: 'Either',
    how: 'Monetizes attention rather than purchase intent — often paired with other models, not a substitute for them.',
    example: 'Common in casual / hyper-casual genres' },
  { id: 'p2e', label: 'Play-to-Earn', icon: 'coins', kind: 'Either',
    how: 'Inverts the flow — the game pays the player, usually in tradeable tokens or assets, rather than the reverse.',
    example: 'Distinct from reward-marketplace models like Mistplay' },
]

/* ---------- Two economies ---------- */
export const ECONOMIES = {
  in: { badge: 'In-Game Economy', keywords: ['Supply', 'Scarcity', 'Player demand'], title: 'Supply vs. demand, inside the game',
    text: 'Items with scarce supply but high use-demand command higher value; items with abundant gameplay supply should be cheap or free, to keep progression from stalling.' },
  out: { badge: 'Out-Game Economy', keywords: ['Purchasing power', 'Willingness to pay', 'Across countries'], title: 'Purchasing power, across markets',
    text: 'The same item needs a different price in different markets — not a currency conversion, but a localization of relative value, sized to what that market can actually bear.' },
}
/** Interview-based benchmark from the project's industry practitioner (best-selling tier, one evergreen line of 6–8 tiers). */
export const BENCHMARKS = {
  us: { label: 'United States (US-like)', lo: 10, hi: 19 },
  vn: { label: 'Vietnam (VN-like)', lo: 5, hi: 7 },
  flat: 15,
  axisMax: 25,
}

/* ---------- Regulation (original six-row table, unaltered wording) ---------- */
export type Stance = 'disc' | 'ban' | 'none'
/** Type of legal instrument behind each status (see INSTRUMENTS). */
export type Instrument = 'enacted' | 'interpretation' | 'proposal' | 'litigation'
export type Jurisdiction = { id: string; name: string; approach: string; stance: Stance; year: string; status: string; source: string; lon: number; lat: number; instrument: Instrument; instrumentBasis: string }
export const JURISDICTIONS: Jurisdiction[] = [
  { id: 'cn', name: 'China', approach: 'Disclosure', stance: 'disc', year: '2017',
    status: 'Mandatory drop-rate disclosure since 2017 — the reason this project has exact odds data',
    source: 'Project regulation table (status, 2026); 2017 milestone on the timeline', lon: 104, lat: 35,
    instrument: 'enacted', instrumentBasis: 'The status describes a mandatory disclosure requirement.' },
  { id: 'be', name: 'Belgium', approach: 'Ban', stance: 'ban', year: '2018',
    status: 'Paid loot boxes = gambling since 2018; criminal fines up to €800,000',
    source: 'Project regulation table (status, 2026); Game Informer (2018)', lon: -4, lat: 48,
    instrument: 'interpretation', instrumentBasis: 'The Belgian Gaming Commission applied the existing 1999 Gambling Act to paid loot boxes (2018 report; Osborne Clarke; CMS).' },
  { id: 'nl', name: 'Netherlands', approach: 'Disclosure', stance: 'disc', year: '2022',
    status: '2022 ruling reversed an earlier gambling classification; game-integration test now applies',
    source: 'Project regulation table (status, 2026)', lon: 4, lat: 56,
    instrument: 'interpretation', instrumentBasis: 'A court ruling (Council of State, 9 March 2022) on how existing gambling law applies (CMS; SCL).' },
  { id: 'kr', name: 'South Korea', approach: 'Disclosure', stance: 'disc', year: '2024',
    status: 'Statutory odds disclosure since 2024, with 3x damages for violations',
    source: 'Project regulation table (status, 2026)', lon: 128, lat: 37,
    instrument: 'enacted', instrumentBasis: 'The status describes statutory (legislated) odds disclosure.' },
  { id: 'us', name: 'United States', approach: 'No federal law', stance: 'none', year: 'No statute',
    status: 'No state or federal statute as of late 2026; active FTC and state-level litigation',
    source: 'Project regulation table (status, 2026)', lon: -98, lat: 39,
    instrument: 'litigation', instrumentBasis: 'No statute; the status describes FTC activity and state-level litigation.' },
  { id: 'eu', name: 'European Union', approach: 'Pending', stance: 'none', year: 'Proposal expected late 2026',
    status: 'No bloc-wide rule yet; Digital Fairness Act proposal expected late 2026',
    source: 'Project regulation table (status, 2026)', lon: 14, lat: 45,
    instrument: 'proposal', instrumentBasis: 'No bloc-wide rule; the status describes a proposal that is expected, not yet adopted.' },
]

export const PUBLISHERS_TEXT = (
  <>
    Three publishers anchor almost every example in this project. <b>Tencent</b> — the world's largest games company by revenue — publishes Honor of Kings and PUBG Mobile. <b>NetEase</b>, China's second-largest publisher, backs Everstone Studio's Where Winds Meet. <b>HoYoverse</b> (miHoYo) publishes Genshin Impact — not a case study here, for reasons the Case Study page explains.
  </>
)
export const SLOWDOWN_TEXT = (
  <>
    2025 was also the first year non-gaming apps out-earned games in in-app purchase revenue globally — a quiet signal that the mobile games market, after a decade of growth, is starting to plateau just as the companies in this study are testing the limits of what freemium pricing can still extract.
  </>
)
export const LOCALIZATION_TEXT = (
  <>
    The localization problem is concrete, not abstract. For one evergreen package line spanning 6–8 price tiers, the practitioner's own benchmark: the best-selling tier in a mature Western market lands around <b>US$10–19</b>, while the best-selling tier for the same package line in Vietnam lands closer to <b>US$5–7</b> — roughly half. A publisher that ports its US price ladder unchanged into a new market isn't neutral; it's mispriced for that market's actual willingness-to-pay on one side or the other.
  </>
)

/** What kind of rule each jurisdiction's status rests on. Labels summarise; the status line carries the nuance. */
export const INSTRUMENTS: Record<Instrument, { label: string; short: string }> = {
  enacted: { label: 'Enacted rule', short: 'Enacted' },
  interpretation: { label: 'Interpretation of existing law (regulator or court)', short: 'Interpretation' },
  litigation: { label: 'Litigation and enforcement, no specific rule', short: 'Litigation' },
  proposal: { label: 'Proposal, not yet adopted', short: 'Proposal' },
}
export const INSTRUMENT_CHECK_SOURCES = 'Instrument types for Belgium and the Netherlands were checked against Osborne Clarke, “Loot box update”; CMS, “Loot boxes: a treasure trove of gambling regulatory issues”; CMS, “Dutch court rules FIFA loot boxes not a game of chance”; SCL, “Loot boxes are NOT gambling under Dutch law”. Others follow from the wording of the original status line.'
