// Number formatting used in reports and exports (legacy/index.html:1213-1215).
export const fmtMoney = (n: number): string => '$' + Math.round(n).toLocaleString('en-US')
export const fmt2 = (n: number): string => '$' + n.toFixed(2)
export const pct = (n: number): string => (n * 100).toFixed(1) + '%'
