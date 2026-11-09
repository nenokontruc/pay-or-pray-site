import { useEffect } from 'react'

const LANGS: [string, string][] = [['en', 'English'], ['zh-CN', '中文'], ['vi', 'Tiếng Việt']]
const current = () => {
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/)
  return m ? decodeURIComponent(m[1]) : 'en'
}
function setLang(code: string) {
  const host = location.hostname, past = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  document.cookie = 'googtrans=; ' + past
  if (host) document.cookie = 'googtrans=; ' + past + '; domain=' + host
  if (code !== 'en') {
    document.cookie = `googtrans=/en/${code}; path=/`
    if (host) document.cookie = `googtrans=/en/${code}; path=/; domain=${host}`
  }
  location.reload()
}

/** Same Google-Translate-cookie mechanism as the original site (EN / 中文 / Tiếng Việt). */
export function LangSwitch() {
  useEffect(() => {
    const lang = current()
    if (lang !== 'en') document.documentElement.setAttribute('data-lang', lang)
    ;(window as unknown as { googleTranslateElementInit: () => void }).googleTranslateElementInit = () => {
      // @ts-expect-error injected by the Google Translate script
      new window.google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'en,zh-CN,vi', autoDisplay: false }, 'google_translate_element')
    }
    if (lang === 'en') return
    const s = document.createElement('script')
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    document.body.appendChild(s)
  }, [])
  return (
    <div className="lang-switch notranslate" translate="no">
      <div id="google_translate_element" />
      <select aria-label="Language" defaultValue={current()} onChange={(e) => setLang(e.target.value)}>
        {LANGS.map(([c, n]) => (<option key={c} value={c}>{n}</option>))}
      </select>
    </div>
  )
}
