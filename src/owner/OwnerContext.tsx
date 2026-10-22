import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_CONTENT, mergeContent, type Bean, type Cake, type MenuItem, type SiteContent, type TextKey } from '../content'
import { useLanguage } from '../i18n/LanguageContext'
import type { Localized } from '../i18n/strings'

/**
 * Light editing: the owner edits a draft in place and "Save" publishes it. In this demo the
 * published content lives in the visitor's browser (localStorage), falling back to memory when
 * storage is blocked. A real build would save to the cafe's own content store instead.
 */
const STORAGE_KEY = 'sh-content-v1'

export type Toast = 'saved' | 'reset'

interface Entries {
  menu: MenuItem
  cakes: Cake
  beans: Bean
}

interface OwnerState {
  /** What the page shows: the draft while editing, otherwise the published content. */
  content: SiteContent
  editing: boolean
  dirty: boolean
  toast: Toast | null
  start: () => void
  update: (patch: Partial<SiteContent>) => void
  /** Sets the current language's version of a top-level text field. */
  updateText: (key: TextKey, value: string) => void
  /** Changes one menu item, cake or bean, found by id. */
  updateEntry: <K extends keyof Entries>(list: K, id: string, patch: Partial<Entries[K]>) => void
  /** `text` with the current language's version replaced. */
  localize: (text: Localized, value: string) => Localized
  save: () => void
  cancel: () => void
  resetDemo: () => void
}

const OwnerContext = createContext<OwnerState | null>(null)

function load(): SiteContent {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? mergeContent(JSON.parse(saved) as Partial<SiteContent>) : DEFAULT_CONTENT
  } catch {
    return DEFAULT_CONTENT
  }
}

function persist(content: SiteContent | null) {
  try {
    if (content) localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* quota or private mode: keep in memory */ }
}

export function OwnerProvider({ children }: { children: ReactNode }) {
  const { lang, t } = useLanguage()
  const [published, setPublished] = useState(load)
  // `?owner` in the URL opens owner mode straight away (handy for screen recordings).
  const [draft, setDraft] = useState<SiteContent | null>(() => new URLSearchParams(window.location.search).has('owner') ? published : null)
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const start = useCallback(() => setDraft((current) => current ?? published), [published])
  const update = useCallback((patch: Partial<SiteContent>) => setDraft((current) => current && { ...current, ...patch }), [])
  const localize = useCallback((text: Localized, value: string): Localized => ({ ...text, [lang]: value }), [lang])
  const updateText = useCallback((key: TextKey, value: string) => {
    setDraft((current) => current && { ...current, [key]: { ...current[key], [lang]: value } })
  }, [lang])
  const updateEntry = useCallback(<K extends keyof Entries>(list: K, id: string, patch: Partial<Entries[K]>) => {
    setDraft((current) => current && {
      ...current,
      [list]: (current[list] as Entries[K][]).map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    })
  }, [])

  const dirty = useMemo(() => !!draft && JSON.stringify(draft) !== JSON.stringify(published), [draft, published])

  const save = useCallback(() => {
    if (!draft) return
    const next = { ...draft, updatedAt: new Date().toISOString() }
    persist(next)
    setPublished(next)
    setDraft(null)
    setToast('saved')
  }, [draft])

  const cancel = useCallback(() => {
    if (dirty && !window.confirm(t.owner.confirmDiscard)) return
    setDraft(null)
  }, [dirty, t])

  const resetDemo = useCallback(() => {
    persist(null)
    setPublished(DEFAULT_CONTENT)
    setDraft(null)
    setToast('reset')
  }, [])

  const value = useMemo<OwnerState>(() => ({
    content: draft ?? published,
    editing: !!draft,
    dirty,
    toast,
    start,
    update,
    updateText,
    updateEntry,
    localize,
    save,
    cancel,
    resetDemo,
  }), [draft, published, dirty, toast, start, update, updateText, updateEntry, localize, save, cancel, resetDemo])

  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>
}

export function useOwner(): OwnerState {
  const state = useContext(OwnerContext)
  if (!state) throw new Error('useOwner must be used inside <OwnerProvider>')
  return state
}
