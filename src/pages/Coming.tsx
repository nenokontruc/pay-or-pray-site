import { Seal } from '../components/Art'

const TITLES: Record<string, string> = {
  framework: 'Two formulas, one variable',
  'case-study': 'Two Chinese games, two ways to sell chance',
  diagnostic: 'Where any freemium good lands',
  simulation: "You're the new monetization manager",
  about: 'About',
}
export default function Coming({ page }: { page: string }) {
  return (
    <div className="wrap coming">
      <Seal size={96} />
      <p className="kicker">{page.replace('-', ' ')}</p>
      <h1 className="page-title">{TITLES[page]}</h1>
      <p className="page-lede">This page is queued in the agreed build order and has not been redesigned yet. Its original content is untouched in your source file.</p>
    </div>
  )
}
