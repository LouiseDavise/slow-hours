import { useState } from 'react'
import type { FormEvent } from 'react'
import { cakeOrderRules } from '../config'
import CakeCard from '../components/CakeCard'
import { FieldError, Sent } from '../components/FormBits'
import { useWhatsApp, WhatsAppIcon } from '../components/WhatsApp'
import { useLanguage } from '../i18n/LanguageContext'
import { isPhone } from '../lib/forms'
import { firstOpenDate, timeSlots } from '../lib/hours'
import { formatRM } from '../lib/money'
import { addDays, useClock, weekday } from '../lib/time'
import { useOwner } from '../owner/OwnerContext'

/** Whole cakes are ready from opening until 30 minutes before closing. */
const PICKUP_SLOTS = { step: 30, endBefore: 30, notice: 0 }
/** Suggested pick-up time: 3pm, tea time. */
const DEFAULT_PICKUP = 15 * 60

export default function Cakes() {
  const { content, editing } = useOwner()
  const { t, pick, longDay } = useLanguage()
  const now = useClock()
  const openWhatsApp = useWhatsApp()
  const c = t.cakes
  const rules = cakeOrderRules
  const wholeCakes = content.cakes.filter((cake) => cake.whole !== null)
  const minDate = addDays(now.date, rules.minDaysAhead)
  const maxDate = addDays(now.date, rules.maxDaysAhead)

  const [cakeId, setCakeId] = useState(wholeCakes[0]?.id ?? '')
  const [date, setDate] = useState(() => firstOpenDate(content.hours, minDate, now, PICKUP_SLOTS))
  const [time, setTime] = useState<number | null>(null)
  const [plaque, setPlaque] = useState('')
  const [candles, setCandles] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [tried, setTried] = useState(false)
  const [sent, setSent] = useState(false)

  const cake = wholeCakes.find((entry) => entry.id === cakeId) ?? wholeCakes[0]
  const slots = date ? timeSlots(content.hours, date, now, PICKUP_SLOTS) : []
  const chosen = time !== null && slots.includes(time) ? time : slots.includes(DEFAULT_PICKUP) ? DEFAULT_PICKUP : slots[0] ?? null
  const day = date ? weekday(date) : null

  const errors = {
    date: !date || date < minDate ? c.errors.soon(rules.minDaysAhead)
      : date > maxDate ? c.errors.far(rules.maxDaysAhead)
      : day !== null && !content.hours[day] ? c.errors.closed(t.days[day])
      : null,
    name: name.trim() ? null : c.errors.name,
    phone: isPhone(phone) ? null : c.errors.phone,
  }
  const valid = !!cake && chosen !== null && !errors.date && !errors.name && !errors.phone

  const orderWhole = (id: string) => {
    setCakeId(id)
    setSent(false)
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' })
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTried(true)
    if (!valid || !cake || chosen === null) return
    openWhatsApp(c.message({
      cake: pick(cake.name),
      size: rules.size,
      price: formatRM(cake.whole!),
      date: longDay(date),
      time: t.time(chosen),
      plaque: plaque.trim(),
      candles,
      name: name.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
    }))
    setSent(true)
  }

  const startOver = () => {
    setSent(false)
    setTried(false)
    setPlaque('')
    setNotes('')
  }

  return (
    <>
      <section className="page-head wrap">
        <p className="eyebrow">{c.eyebrow}</p>
        <h1>{c.title}</h1>
        <p className="lead">{c.lead}</p>
      </section>

      <section className="section wrap section-tight">
        {editing && <p className="owner-tip">{t.owner.cakesTip}</p>}
        <div className="cake-grid">
          {content.cakes.map((entry) => <CakeCard key={entry.id} cake={entry} onOrder={orderWhole} />)}
        </div>
      </section>

      <section id="order" className="band-tint anchor">
        <div className="wrap">
          <div className="order-intro">
            <div>
              <p className="eyebrow">{c.orderEyebrow}</p>
              <h2>{c.orderTitle}</h2>
              <p className="lead">{c.orderLead(rules.minDaysAhead)}</p>
              <ul className="ticks">
                {c.facts(rules.size, rules.minDaysAhead).map((fact) => <li key={fact}>{fact}</li>)}
              </ul>
            </div>
            <div className="photo arch arch-small"><img src="/images/cake-celebration.jpg" alt={c.celebrationAlt} loading="lazy" /></div>
          </div>

          {sent ? (
            <Sent title={c.sentTitle} text={c.sentText} again={c.another} onAgain={startOver} />
          ) : (
            <form className="order" onSubmit={submit} noValidate>
              <div className="form-card">
                <label className="field">
                  <span>{c.cake}</span>
                  <select value={cake?.id ?? ''} onChange={(event) => setCakeId(event.target.value)}>
                    {wholeCakes.map((entry) => <option key={entry.id} value={entry.id}>{pick(entry.name)} · {formatRM(entry.whole!)}</option>)}
                  </select>
                </label>
                <div className="field-row">
                  <label className="field">
                    <span>{c.date}</span>
                    <input type="date" min={minDate} max={maxDate} value={date} aria-invalid={!!errors.date} onChange={(event) => setDate(event.target.value)} />
                    {errors.date ? <span className="field-error">{errors.date}</span> : <span className="field-hint">{longDay(date)}</span>}
                  </label>
                  <label className="field">
                    <span>{c.time}</span>
                    <select value={chosen ?? ''} disabled={!slots.length} onChange={(event) => setTime(Number(event.target.value))}>
                      {slots.map((minutes) => <option key={minutes} value={minutes}>{t.time(minutes)}</option>)}
                    </select>
                  </label>
                </div>
                <label className="field">
                  <span>{c.plaque}</span>
                  <input value={plaque} maxLength={rules.messageMax} placeholder={c.plaquePlaceholder} onChange={(event) => setPlaque(event.target.value)} />
                  <span className="field-hint">{c.plaqueCount(plaque.length, rules.messageMax)}</span>
                </label>
                <label className="check">
                  <input type="checkbox" checked={candles} onChange={(event) => setCandles(event.target.checked)} />
                  {c.candles}
                </label>
                <div className="field-row">
                  <label className="field">
                    <span>{c.name}</span>
                    <input value={name} autoComplete="name" aria-invalid={tried && !!errors.name} onChange={(event) => setName(event.target.value)} />
                    <FieldError show={tried}>{errors.name}</FieldError>
                  </label>
                  <label className="field">
                    <span>{c.phone}</span>
                    <input type="tel" inputMode="tel" autoComplete="tel" placeholder={c.phonePlaceholder} value={phone} aria-invalid={tried && !!errors.phone} onChange={(event) => setPhone(event.target.value)} />
                    <FieldError show={tried}>{errors.phone}</FieldError>
                  </label>
                </div>
                <label className="field">
                  <span>{c.notes}</span>
                  <textarea rows={3} placeholder={c.notesPlaceholder} value={notes} onChange={(event) => setNotes(event.target.value)} />
                </label>
              </div>

              <aside className="summary">
                {cake && <img className="summary-photo" src={cake.photo} alt="" />}
                <p className="summary-eyebrow">{c.summary}</p>
                <h3>{cake ? pick(cake.name) : '–'}</h3>
                <dl>
                  <div><dt>{c.date}</dt><dd>{errors.date ? '–' : longDay(date)}</dd></div>
                  <div><dt>{c.time}</dt><dd>{chosen !== null ? t.time(chosen) : '–'}</dd></div>
                  {plaque.trim() && <div><dt>{c.plaque}</dt><dd>“{plaque.trim()}”</dd></div>}
                </dl>
                <p className="total"><span>{c.total}</span><b>{cake?.whole ? formatRM(cake.whole) : '–'}</b></p>
                <p className="summary-note">{c.payNote}</p>
                <button type="submit" className="btn btn-light btn-block"><WhatsAppIcon />{c.submit}</button>
              </aside>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
