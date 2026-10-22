import { useLayoutEffect, useRef } from 'react'
import { useOwner } from './OwnerContext'
import type { OpeningHours } from '../content'
import { useLanguage } from '../i18n/LanguageContext'
import { formatRM, plainRM } from '../lib/money'
import { toMinutes, useClock } from '../lib/time'

// Each field renders plain content for visitors and an inline input (dashed outline) in owner mode.

export function EditableText({ value, onChange, label, multiline }: {
  value: string
  onChange: (value: string) => void
  label: string
  multiline?: boolean
}) {
  const { editing } = useOwner()
  const area = useRef<HTMLTextAreaElement>(null)

  // Grow the textarea with its text so headings keep their shape while editing (again once the
  // web fonts have loaded, since they change the line breaks).
  useLayoutEffect(() => {
    const el = area.current
    if (!el) return
    const fit = () => {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
    fit()
    document.fonts.ready.then(fit)
  }, [value, editing])

  if (!editing) return <>{value}</>
  return multiline
    ? <textarea ref={area} className="owner-field owner-area" value={value} aria-label={label} rows={1} onChange={(event) => onChange(event.target.value)} />
    : <input className="owner-field" value={value} aria-label={label} onChange={(event) => onChange(event.target.value)} />
}

/** A ringgit price: "RM 14" (or just "14" on menu boards). Whole ringgit only. */
export function EditablePrice({ value, onChange, label, plain }: {
  value: number
  onChange: (value: number) => void
  label: string
  plain?: boolean
}) {
  const { editing } = useOwner()
  if (!editing) return <>{plain ? plainRM(value) : formatRM(value)}</>
  return (
    <span className="owner-price">
      {!plain && 'RM '}
      <input
        className="owner-field owner-number"
        inputMode="numeric"
        style={{ width: '4.5ch' }}
        value={value || ''}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, '').slice(0, 4)) || 0)}
      />
    </span>
  )
}

/** Shrinks an uploaded photo to a small JPEG data URL so it fits in browser storage. */
async function photoToDataUrl(file: File, maxSide = 1000): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.8)
}

/** A photo that fills its frame; in owner mode it gets a change-photo button. */
export function EditablePhoto({ src, alt, onChange, className, loading }: {
  src: string
  alt: string
  onChange: (dataUrl: string) => void
  className?: string
  loading?: 'lazy' | 'eager'
}) {
  const { editing } = useOwner()
  const { t } = useLanguage()
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className={`photo${editing ? ' is-editing' : ''}${className ? ` ${className}` : ''}`}>
      <img src={src} alt={alt} loading={loading} />
      {editing && (
        <>
          <button type="button" className="owner-photo-btn" onClick={() => input.current?.click()}>{t.owner.changePhoto}</button>
          <input
            ref={input}
            type="file"
            accept="image/*"
            hidden
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (file) onChange(await photoToDataUrl(file))
              event.target.value = ''
            }}
          />
        </>
      )}
    </div>
  )
}

/** Owner-mode checkbox for "sold out today"; visitors see the badge the page renders instead. */
export function SoldOutToggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  const { editing } = useOwner()
  const { t } = useLanguage()
  if (!editing) return null
  return (
    <label className="owner-check">
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
      {t.owner.soldOut}
    </label>
  )
}

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

/** Opening hours, Monday first; in owner mode each day gets open/close times and a closed toggle. */
export function EditableHours({ hours, onChange }: { hours: OpeningHours; onChange: (hours: OpeningHours) => void }) {
  const { editing } = useOwner()
  const { t } = useLanguage()
  const today = useClock().day
  const setDay = (day: number, slot: [string, string] | null) => onChange({ ...hours, [day]: slot })
  return (
    <table className={`hours${editing ? ' is-editing' : ''}`}>
      <tbody>
        {WEEK_ORDER.map((day) => {
          const slot = hours[day]
          return (
            <tr key={day} className={!editing && day === today ? 'is-today' : undefined}>
              <th scope="row">{t.days[day]}</th>
              <td>
                {!editing && (slot ? `${t.time(toMinutes(slot[0]))} – ${t.time(toMinutes(slot[1]))}` : t.owner.closed)}
                {editing && (
                  <span className="owner-hours">
                    <label className="owner-check">
                      <input type="checkbox" checked={!slot} onChange={(event) => setDay(day, event.target.checked ? null : ['09:00', '22:00'])} />
                      {t.owner.closed}
                    </label>
                    {slot && (
                      <span className="owner-times">
                        <input className="owner-field owner-time" type="time" value={slot[0]} aria-label={t.owner.opens(t.days[day])} onChange={(event) => setDay(day, [event.target.value || slot[0], slot[1]])} />
                        –
                        <input className="owner-field owner-time" type="time" value={slot[1]} aria-label={t.owner.closes(t.days[day])} onChange={(event) => setDay(day, [slot[0], event.target.value || slot[1]])} />
                      </span>
                    )}
                  </span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
