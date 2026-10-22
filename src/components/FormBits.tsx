import type { ReactNode } from 'react'
import { business } from '../config'
import { useLanguage } from '../i18n/LanguageContext'

/** Shown in place of a form once it has gone. */
export function Sent({ title, text, note, again, onAgain }: { title: string; text: string; note?: string; again: string; onAgain: () => void }) {
  return (
    <div className="sent" role="status">
      <span className="sent-mark" aria-hidden="true">✓</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {note && <p className="sent-note">{note}</p>}
      <button type="button" className="btn btn-line" onClick={onAgain}>{again}</button>
    </div>
  )
}

/** A field's error, once the visitor has tried to send. */
export function FieldError({ show, children }: { show: boolean; children: ReactNode }) {
  return show && children ? <span className="field-error">{children}</span> : null
}

/** GrabFood and foodpanda buttons (hidden when the cafe has no store link). */
export function DeliveryStrip() {
  const { t } = useLanguage()
  const m = t.menu
  return (
    <div className="delivery">
      <div>
        <h2>{m.delivery}</h2>
        <p>{m.deliveryText}</p>
      </div>
      <div className="ctas">
        {business.delivery.grab && <a className="btn btn-light" href={business.delivery.grab} target="_blank" rel="noreferrer">{m.grab}</a>}
        {business.delivery.foodpanda && <a className="btn btn-line-light" href={business.delivery.foodpanda} target="_blank" rel="noreferrer">{m.foodpanda}</a>}
      </div>
    </div>
  )
}
