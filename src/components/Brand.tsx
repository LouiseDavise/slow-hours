import { Link } from 'react-router-dom'
import { business } from '../config'
import { useLanguage } from '../i18n/LanguageContext'

/** A cup seen from above, with clock hands: coffee, by the hour. */
export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`mark ${className}`} aria-hidden="true">
      <circle cx="22" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="22" cy="24" r="12.5" fill="currentColor" />
      <rect x="34.5" y="21.25" width="8" height="5.5" rx="2.75" fill="currentColor" />
      <path className="mark-hands" d="M22 24V15.5M22 24l5.5 3.2" strokeWidth="1.9" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function Logo() {
  const { t } = useLanguage()
  return (
    <Link to="/" className="logo" aria-label={t.layout.homeLabel(business.name)}>
      <Mark />
      <span className="logo-words">
        <b>Slow Hours</b>
        <small>{business.tagline} · TTDI</small>
      </span>
    </Link>
  )
}
