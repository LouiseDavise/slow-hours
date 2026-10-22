import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { reservationRules } from '../config'
import { FieldError, Sent } from '../components/FormBits'
import { useWhatsApp, WhatsAppIcon } from '../components/WhatsApp'
import { useLanguage } from '../i18n/LanguageContext'
import { OCCASIONS, SEATS, type Occasion, type Seat } from '../i18n/strings'
import { isPhone } from '../lib/forms'
import { firstOpenDate, timeSlots } from '../lib/hours'
import { addDays, useClock, weekday } from '../lib/time'
import { useOwner } from '../owner/OwnerContext'

const SLOTS = {
  step: reservationRules.step,
  endBefore: reservationRules.lastSeatingMinutes,
  notice: reservationRules.minNoticeMinutes,
}

/** Table reservations (the "Booking via WhatsApp" add-on): the request arrives in the cafe's WhatsApp. */
export default function Reserve() {
  const { content } = useOwner()
  const { t, longDay } = useLanguage()
  const now = useClock()
  const openWhatsApp = useWhatsApp()
  const r = t.reserve
  const maxDate = addDays(now.date, reservationRules.maxDaysAhead)

  const [date, setDate] = useState(() => firstOpenDate(content.hours, now.date, now, SLOTS))
  const [time, setTime] = useState<number | null>(null)
  const [guests, setGuests] = useState(2)
  const [seat, setSeat] = useState<Seat>('any')
  const [occasion, setOccasion] = useState<Occasion>('none')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [tried, setTried] = useState(false)
  const [sent, setSent] = useState(false)

  const day = date ? weekday(date) : null
  const dateError = !date ? r.errors.date
    : date < now.date ? r.errors.past
    : date > maxDate ? r.errors.far(reservationRules.maxDaysAhead)
    : day !== null && !content.hours[day] ? r.errors.closed(t.days[day])
    : null
  const slots = date && !dateError ? timeSlots(content.hours, date, now, SLOTS) : []
  const chosen = time !== null && slots.includes(time) ? time : null
  const errors = {
    time: chosen === null ? r.errors.time : null,
    name: name.trim() ? null : r.errors.name,
    phone: isPhone(phone) ? null : r.errors.phone,
  }
  const valid = !dateError && !errors.time && !errors.name && !errors.phone

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTried(true)
    if (!valid || chosen === null) return
    openWhatsApp(r.message({
      date: longDay(date),
      time: t.time(chosen),
      guests,
      seat: r.seats[seat].label,
      occasion: occasion === 'none' ? null : r.occasions[occasion],
      name: name.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
    }))
    setSent(true)
  }

  const startOver = () => {
    setSent(false)
    setTried(false)
    setTime(null)
    setNotes('')
  }

  return (
    <>
      <section className="page-head wrap">
        <p className="eyebrow">{r.eyebrow}</p>
        <h1>{r.title}</h1>
        <p className="lead">{r.lead}</p>
      </section>

      <section className="section wrap section-tight">
        {sent ? (
          <Sent title={r.sentTitle} text={r.sentText} again={r.another} onAgain={startOver} />
        ) : (
          <form className="order" onSubmit={submit} noValidate>
            <div className="form-card">
              <div className="field-row">
                <label className="field">
                  <span>{r.date}</span>
                  <input type="date" min={now.date} max={maxDate} value={date} aria-invalid={!!dateError} onChange={(event) => { setDate(event.target.value); setTime(null) }} />
                  {dateError ? <span className="field-error">{dateError}</span> : <span className="field-hint">{longDay(date)}</span>}
                </label>
                <label className="field">
                  <span>{r.time}</span>
                  <select value={chosen ?? ''} disabled={!slots.length} aria-invalid={tried && !!errors.time} onChange={(event) => setTime(event.target.value ? Number(event.target.value) : null)}>
                    <option value="">{r.pickTime}</option>
                    {slots.map((minutes) => <option key={minutes} value={minutes}>{t.time(minutes)}</option>)}
                  </select>
                  {!dateError && !slots.length
                    ? <span className="field-error">{r.noTimes}</span>
                    : <FieldError show={tried}>{errors.time}</FieldError>}
                </label>
              </div>

              <div className="field">
                <span id="guests-label">{r.guests}</span>
                <div className="stepper" role="group" aria-labelledby="guests-label">
                  <button type="button" aria-label={r.fewer} disabled={guests <= 1} onClick={() => setGuests((value) => value - 1)}>−</button>
                  <output aria-live="polite">{guests}</output>
                  <button type="button" aria-label={r.more} disabled={guests >= reservationRules.maxGuests} onClick={() => setGuests((value) => value + 1)}>+</button>
                </div>
                <span className="field-hint">{r.guestsHint(reservationRules.maxGuests)}</span>
              </div>

              <fieldset className="field">
                <legend>{r.seating}</legend>
                <div className="seat-options">
                  {SEATS.map((option) => (
                    <label key={option} className={`seat-option${seat === option ? ' is-on' : ''}`}>
                      <input type="radio" name="seat" value={option} checked={seat === option} onChange={() => setSeat(option)} />
                      <b>{r.seats[option].label}</b>
                      <span>{r.seats[option].hint}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="field">
                <span>{r.occasion}</span>
                <select value={occasion} onChange={(event) => setOccasion(event.target.value as Occasion)}>
                  {OCCASIONS.map((option) => <option key={option} value={option}>{r.occasions[option]}</option>)}
                </select>
              </label>
              {occasion === 'birthday' && (
                <p className="tip">{r.cakeTip} <Link to="/cakes#order">{r.cakeLink} →</Link></p>
              )}

              <div className="field-row">
                <label className="field">
                  <span>{r.name}</span>
                  <input value={name} autoComplete="name" aria-invalid={tried && !!errors.name} onChange={(event) => setName(event.target.value)} />
                  <FieldError show={tried}>{errors.name}</FieldError>
                </label>
                <label className="field">
                  <span>{r.phone}</span>
                  <input type="tel" inputMode="tel" autoComplete="tel" placeholder={r.phonePlaceholder} value={phone} aria-invalid={tried && !!errors.phone} onChange={(event) => setPhone(event.target.value)} />
                  <FieldError show={tried}>{errors.phone}</FieldError>
                </label>
              </div>
              <label className="field">
                <span>{r.notes}</span>
                <textarea rows={3} placeholder={r.notesPlaceholder} value={notes} onChange={(event) => setNotes(event.target.value)} />
              </label>
            </div>

            <aside className="summary">
              <p className="summary-eyebrow">{r.summary}</p>
              <h3>{dateError ? r.pickDate : longDay(date)}</h3>
              <dl>
                <div><dt>{r.time}</dt><dd>{chosen !== null ? t.time(chosen) : '–'}</dd></div>
                <div><dt>{r.guests}</dt><dd>{guests}</dd></div>
                <div><dt>{r.seatingShort}</dt><dd>{r.seats[seat].label}</dd></div>
                {occasion !== 'none' && <div><dt>{r.occasion}</dt><dd>{r.occasions[occasion]}</dd></div>}
              </dl>
              <p className="summary-eyebrow">{r.rulesTitle}</p>
              <ul className="summary-rules">
                {r.rules(reservationRules.holdMinutes, reservationRules.weekendTableMinutes).map((rule) => <li key={rule}>{rule}</li>)}
              </ul>
              <button type="submit" className="btn btn-light btn-block"><WhatsAppIcon />{r.submit}</button>
            </aside>
          </form>
        )}
      </section>
    </>
  )
}
