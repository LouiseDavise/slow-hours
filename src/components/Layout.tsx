import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { business, mapsLink, stoedio } from '../config'
import type { OpeningHours } from '../content'
import { useLanguage } from '../i18n/LanguageContext'
import { LANGS, STRINGS } from '../i18n/strings'
import { formatStamp, toMinutes } from '../lib/time'
import { EditableText } from '../owner/fields'
import { useOwner } from '../owner/OwnerContext'
import { Logo, Mark } from './Brand'
import { useWhatsApp, WhatsAppIcon } from './WhatsApp'

/** Header switch: EN | BM. */
function LanguageSwitch() {
  const { lang, t, setLang } = useLanguage()
  return (
    <div className="lang-switch" role="group" aria-label={t.layout.language}>
      {LANGS.map((item) => (
        <button key={item} type="button" lang={item} aria-pressed={lang === item} aria-label={STRINGS[item].langName} onClick={() => setLang(item)}>
          {item === 'ms' ? 'BM' : 'EN'}
        </button>
      ))}
    </div>
  )
}

/** The owner's announcement strip; owner mode edits the text and can hide it. */
function Notice() {
  const { content, editing, update, localize } = useOwner()
  const { t, pick } = useLanguage()
  const { notice } = content
  if (!notice.on && !editing) return null
  return (
    <div className={`notice${notice.on ? '' : ' is-off'}`} role="note">
      <p><EditableText multiline value={pick(notice.text)} onChange={(value) => update({ notice: { ...notice, text: localize(notice.text, value) } })} label={t.owner.fields.notice} /></p>
      {editing && (
        <label className="owner-check">
          <input type="checkbox" checked={notice.on} onChange={(event) => update({ notice: { ...notice, on: event.target.checked } })} />
          {t.owner.showNotice}
        </label>
      )}
    </div>
  )
}

function OwnerBar() {
  const { editing, dirty, save, cancel } = useOwner()
  const { t } = useLanguage()
  if (!editing) return null
  return (
    <div className="owner-bar" role="region" aria-label={t.owner.mode}>
      <p><b>{t.owner.mode}</b><span> · {t.owner.hint}</span><small>{t.owner.editingLang}</small></p>
      <div className="owner-bar-actions">
        <button type="button" className="btn btn-small btn-ghost-light" onClick={cancel}>{t.owner.cancel}</button>
        <button type="button" className="btn btn-small btn-save" onClick={save} disabled={!dirty}>{t.owner.save}</button>
      </div>
    </div>
  )
}

/** Opening hours with consecutive identical days merged: "Tue – Thu  9am – 10pm". */
function groupHours(hours: OpeningHours): { days: number[]; slot: [string, string] | null }[] {
  const groups: { days: number[]; slot: [string, string] | null }[] = []
  for (const day of [1, 2, 3, 4, 5, 6, 0]) {
    const slot = hours[day]
    const last = groups[groups.length - 1]
    if (last && JSON.stringify(last.slot) === JSON.stringify(slot)) last.days.push(day)
    else groups.push({ days: [day], slot })
  }
  return groups
}

/** Scroll to the top on page change, or to `#id` when the link has one. */
function useScrollOnNavigate() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
}

export default function Layout() {
  const { content, editing, start, resetDemo, toast } = useOwner()
  const { t } = useLanguage()
  const openWhatsApp = useWhatsApp()
  const l = t.layout
  const nav = [
    { to: '/menu', label: l.nav.menu },
    { to: '/cakes', label: l.nav.cakes },
    { to: '/space', label: l.nav.space },
    { to: '/visit', label: l.nav.visit },
  ]
  useScrollOnNavigate()

  return (
    <div className={`app${editing ? ' is-editing' : ''}`}>
      <div className="top-stack">
        {business.demo && (
          <div className="demo-banner" role="note">
            <span>{l.demoBy} <b>STOEDIO</b>. {l.demoFictional(business.name)}</span>
            <a href={stoedio.url}>{l.demoCta}</a>
          </div>
        )}
        <OwnerBar />
      </div>
      <Notice />

      <header className="site-header">
        <div className="wrap header-inner">
          <Logo />
          <nav className="site-nav" aria-label={l.navLabel}>
            {nav.map((item) => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
          </nav>
          <LanguageSwitch />
          <Link to="/reserve" className="btn btn-dark btn-small">{l.reserve}</Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <Mark className="footer-mark" />
            <p className="footer-name">Slow Hours</p>
            <p className="footer-tagline">{l.tagline}</p>
          </div>
          <div>
            <h2>{l.hours}</h2>
            <dl className="footer-hours">
              {groupHours(content.hours).map(({ days, slot }) => (
                <div key={days.join()}>
                  <dt>{days.length > 1 ? `${t.daysShort[days[0]]} – ${t.daysShort[days[days.length - 1]]}` : t.daysShort[days[0]]}</dt>
                  <dd>{slot ? `${t.time(toMinutes(slot[0]))} – ${t.time(toMinutes(slot[1]))}` : t.owner.closed}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2>{l.findUs}</h2>
            <p>{business.address}</p>
            <p><a href={mapsLink} target="_blank" rel="noreferrer">{t.home.directions} →</a></p>
          </div>
          <div>
            <h2>{l.follow}</h2>
            <ul className="footer-links">
              <li><a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noreferrer">Instagram · @{business.instagram}</a></li>
              <li><button type="button" className="link-button" onClick={() => openWhatsApp(l.generalMessage(business.name))}>WhatsApp · {business.phoneDisplay}</button></li>
              <li><a href={`mailto:${business.email}`}>{business.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <p>© {new Date().getFullYear()} {business.name}</p>
          {content.updatedAt && <p>{l.updatedAt} {formatStamp(content.updatedAt, t.locale)}</p>}
          <p>{l.credit} <a href={stoedio.url}>STOEDIO</a></p>
          {business.demo && <button type="button" className="link-button" onClick={resetDemo}>{l.resetDemo}</button>}
        </div>
      </footer>

      <div className="floaters">
        {!editing && (
          <button type="button" className="owner-toggle" onClick={start}>
            <span aria-hidden="true">✎</span> {t.owner.mode}{business.demo && <small>{t.owner.try}</small>}
          </button>
        )}
        <button type="button" className="wa-float" aria-label={l.chat} onClick={() => openWhatsApp(l.generalMessage(business.name))}>
          <WhatsAppIcon />
        </button>
      </div>

      {toast && <div className="toast" role="status">{toast === 'saved' ? t.owner.toastSaved : t.owner.toastReset}</div>}
    </div>
  )
}
