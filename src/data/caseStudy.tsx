// Case Study content — verbatim from legacy/index.html:765-876 (the academic reference).
// Numbers here are the published figures; do not edit without updating the sources.
import type { ReactNode } from 'react'

export const WWM_ODDS = 0.000415 // 0.0415% featured outfit, fixed (BitTopup 2025; in-game disclosure)
export const WWM_GUARANTEE = 150 // guarantee by pull 150
export const HOK_START_ODDS = 0.008 // 0.8% Honor Crystal, rising each draw (Toutiao 2025)
export const HOK_GUARANTEE = 361 // guarantee by draw 361

export interface Fact { k: ReactNode; v: ReactNode }
export interface GameCol {
  id: 'hok' | 'wwm'
  tone: 'solid' | 'outline'
  name: string
  sub: ReactNode
  groups: { label: ReactNode; icon: string; facts: Fact[] }[]
}

export const GAMES: GameCol[] = [
  {
    id: 'hok', tone: 'solid', name: 'Honor of Kings',
    sub: <>Tencent &middot; MOBA &middot; cosmetic-first; skins carry small stat bonuses</>,
    groups: [
      { label: 'Fixed-price shop', icon: 'cart', facts: [
        { k: 'Skin price ladder', v: <>288 &ndash; 1,788 pts</> },
        { k: 'Recharge ladder', v: <>&yen;6 / 30 / 68 / 128 / 328 / 648</> },
      ] },
      { label: <>Lucky draw &middot; 积分夺宝 (Points Treasure Hunt)</>, icon: 'capsule', facts: [
        { k: 'Starting odds (Honor Crystal)', v: '0.8%, rising each draw' },
        { k: 'Guarantee', v: 'by draw 361' },
        { k: 'Prize', v: <>Crystal &rarr; skin of your choice</> },
        { k: 'Limited variant (暴击夺宝)', v: '360 guarantee, random skin' },
      ] },
      { label: 'Scale', icon: 'chart', facts: [
        { k: '2016 revenue', v: <>&yen;6.8B</> },
        { k: '2024 daily revenue', v: <>~&yen;100M/day</> },
      ] },
    ],
  },
  {
    id: 'wwm', tone: 'outline', name: 'Where Winds Meet',
    sub: <>Everstone Studio / NetEase &middot; Wuxia RPG &middot; China launch Dec 2024 &middot; global Nov 2025 &middot; cosmetic only</>,
    groups: [
      { label: 'Fixed-price shop', icon: 'cart', facts: [
        { k: 'Direct purchase', v: 'Fixed-price Echo Beads' },
      ] },
      { label: <>Lucky draw &middot; Celestial / Solemn Echo</>, icon: 'capsule', facts: [
        { k: 'Featured odds', v: '0.0415%, fixed' },
        { k: 'Material odds', v: '0.747%' },
        { k: 'Guarantee', v: 'by pull 150' },
        { k: 'Prize', v: 'One specific named outfit' },
      ] },
      { label: 'Scale', icon: 'chart', facts: [
        { k: 'First 14 months since China launch (mobile)', v: '~$115M (~$8M/mo)' },
      ] },
    ],
  },
]

/** The original comparison table, row by row, plus the source sentence that explains each row (where one exists). */
export interface CompareRow { id: string; label: string; hok: ReactNode; wwm: ReactNode; why?: ReactNode; whySource?: string }
export const COMPARE: CompareRow[] = [
  { id: 'odds', label: 'Starting odds', hok: '0.8% for the Honor Crystal', wwm: '0.0415% for the featured outfit' },
  { id: 'change', label: 'How odds change', hok: <>Rise with a &ldquo;luck value&rdquo; on every draw</>, wwm: 'Fixed until the guarantee',
    why: 'The probability chart below shows what each design means for the chance of having won after a given number of draws.' },
  { id: 'guarantee', label: 'Guarantee', hok: '361 draws (360 in the limited version)', wwm: '150 pulls, shared across both banners',
    why: <>A guaranteed prize matters economically, not just for goodwill. It moves a draw toward the &ldquo;unique box&rdquo; design, where every purchase yields an item the player doesn&rsquo;t already own.</>,
    whySource: 'Chen, Elmachtoub, Hamilton & Lei, 2021' },
  { id: 'win', label: 'What you win', hok: <>A crystal you exchange for the collector skin <b>you</b> choose</>, wwm: <>One specific outfit <b>the studio</b> chose</>,
    why: <>In Honor of Kings, chance decides <i>how much</i> you pay, but you choose <i>what</i> you get &mdash; the lottery turns back into a known purchase at the end.</> },
  { id: 'pay', label: 'What you pay with', hok: 'Honor points and draw tickets, much of it accumulated from recharge events and free giveaways', wwm: 'Paid Echo Beads, or Echo Jade earned slowly through play',
    why: <>Because much of the draw currency builds up as a side effect of spending, the lottery works more like a loyalty rebate layered on the shop than a standalone product.</> },
  { id: 'p2w', label: 'Pay-to-win', hok: <>Negligible &mdash; many skins add small stat bonuses (e.g. +10 attack)</>, wwm: 'None in either channel',
    why: <>What can be held (approximately) constant is power: Where Winds Meet sells none in any channel, and Honor of Kings&rsquo; skins add only small stat bonuses. This near-match on power is a limitation worth stating, not a perfect control.</> },
]

export const CASE_REFERENCES: ReactNode[] = [
  '17173.com (2026). 王者荣耀积分夺宝折扣 / 暴击夺宝避坑指南 [Honor of Kings draw events].',
  'NetEase / 163.com (2026). 王者3倍暴击夺宝上架 [Crit Treasure Hunt launch and comparison].',
  'Toutiao (2025). 王者荣耀积分夺宝抽水晶技巧 [Honor Crystal odds and guarantee].',
  <>NetEase / 163.com (n.d.). 王者荣耀&ldquo;隐藏属性&rdquo;皮肤 [Skin stat bonuses]. Tencent Cloud Developer (n.d.), skin +10 attack example.</>,
  'KeenGamer (2025). Where Winds Meet release dates (China Dec 27, 2024; global Nov 14, 2025).',
  'BitTopup (2025). Where Winds Meet Gacha Rates & Spending Guide.',
  <>Naavik (2026). Evaluating the &ldquo;Fair&rdquo; Gacha Games Experiment.</>,
  <>Chen, N., Elmachtoub, A., Hamilton, M., &amp; Lei, X. (2021). Loot Box Pricing and Design. <i>Management Science.</i></>,
]
export const CASE_FOOTER_META = <>Drop rates and guarantees are as reported by gaming press and in-game disclosures, which Chinese law requires. Event terms change over time; figures reflect reporting from 2025&ndash;2026.</>
