import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LANGS, STRINGS, type Lang, type Localized, type Strings } from './strings'
import { formatDate, type DateKey } from '../lib/time'

const STORAGE_KEY = 'sh-lang'

interface LanguageState {
  lang: Lang
  t: Strings
  setLang: (lang: Lang) => void
  /** The current language's version of owner-editable text. */
  pick: (text: Localized) => string
  /** "Saturday 24 October" */
  longDay: (date: DateKey) => string
}

const LanguageContext = createContext<LanguageState | null>(null)

/** `?lang=ms` in the URL, then the saved choice, otherwise English. */
function initialLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (LANGS.includes(fromUrl as Lang)) return fromUrl as Lang
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LANGS.includes(saved as Lang)) return saved as Lang
  } catch { /* storage blocked: default */ }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setChoice] = useState(initialLang)
  const t = STRINGS[lang]

  const setLang = useCallback((next: Lang) => {
    setChoice(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* private mode: English next visit */ }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
  }, [lang, t])

  const value = useMemo<LanguageState>(() => ({
    lang,
    t,
    setLang,
    pick: (text) => text[lang],
    longDay: (date) => formatDate(date, t.locale, { weekday: 'long', day: 'numeric', month: 'long' }),
  }), [lang, t, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageState {
  const state = useContext(LanguageContext)
  if (!state) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return state
}
