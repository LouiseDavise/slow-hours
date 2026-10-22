import { useState } from 'react'
import type { FormEvent } from 'react'
import { business, mapsLink } from '../config'
import { DeliveryStrip, FieldError, Sent } from '../components/FormBits'
import { useWhatsApp } from '../components/WhatsApp'
import { useLanguage } from '../i18n/LanguageContext'
import { TOPICS, type Topic } from '../i18n/strings'
import { isEmail } from '../lib/forms'
import { EditableHours } from '../owner/fields'
import { useOwner } from '../owner/OwnerContext'

/**
 * Contact form (included in Business). The live site sends it to the cafe's inbox through a form
 * service; the demo only confirms it.
 */
function ContactForm() {
  const { t } = useLanguage()
  const v = t.visit
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState<Topic>('general')
  const [message, setMessage] = useState('')
  const [tried, setTried] = useState(false)
  const [sent, setSent] = useState(false)

  const errors = {
    name: name.trim() ? null : v.errors.name,
    email: isEmail(email) ? null : v.errors.email,
    message: message.trim() ? null : v.errors.message,
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTried(true)
    if (!errors.name && !errors.email && !errors.message) setSent(true)
  }

  if (sent) {
    return (
      <Sent
        title={v.sentTitle(name.trim())}
        text={v.sentText(email.trim())}
        note={business.demo ? v.demoNote(business.email) : undefined}
        again={v.another}
        onAgain={() => { setSent(false); setTried(false); setMessage('') }}
      />
    )
  }

  return (
    <form className="form-card" onSubmit={submit} noValidate>
      <div className="field-row">
        <label className="field">
          <span>{v.form.name}</span>
          <input value={name} autoComplete="name" aria-invalid={tried && !!errors.name} onChange={(event) => setName(event.target.value)} />
          <FieldError show={tried}>{errors.name}</FieldError>
        </label>
        <label className="field">
          <span>{v.form.email}</span>
          <input type="email" autoComplete="email" value={email} aria-invalid={tried && !!errors.email} onChange={(event) => setEmail(event.target.value)} />
          <FieldError show={tried}>{errors.email}</FieldError>
        </label>
      </div>
      <label className="field">
        <span>{v.form.topic}</span>
        <select value={topic} onChange={(event) => setTopic(event.target.value as Topic)}>
          {TOPICS.map((option) => <option key={option} value={option}>{v.form.topics[option]}</option>)}
        </select>
      </label>
      <label className="field">
        <span>{v.form.message}</span>
        <textarea rows={5} placeholder={v.form.messagePlaceholder} value={message} aria-invalid={tried && !!errors.message} onChange={(event) => setMessage(event.target.value)} />
        <FieldError show={tried}>{errors.message}</FieldError>
      </label>
      <button type="submit" className="btn btn-dark">{v.form.submit}</button>
    </form>
  )
}

export default function Visit() {
  const { content, update } = useOwner()
  const { t } = useLanguage()
  const openWhatsApp = useWhatsApp()
  const v = t.visit

  return (
    <>
      <section className="page-head wrap">
        <p className="eyebrow">{v.eyebrow}</p>
        <h1>{v.title}</h1>
        <p className="lead">{v.lead}</p>
      </section>

      <section className="section wrap section-tight visit-grid">
        <div className="visit-info">
          <div>
            <h2>{v.address}</h2>
            <p className="address">{business.address}</p>
            <a className="btn btn-dark btn-small" href={mapsLink} target="_blank" rel="noreferrer">{v.directions}</a>
          </div>
          <div>
            <h2>{v.gettingHere}</h2>
            <dl className="info-list">
              {v.transit.map((item) => <div key={item.mode}><dt>{item.mode}</dt><dd>{item.text}</dd></div>)}
            </dl>
          </div>
          <div>
            <h2>{v.hours}</h2>
            <EditableHours hours={content.hours} onChange={(hours) => update({ hours })} />
            <p className="small-note">{v.hoursNote}</p>
          </div>
          <div>
            <h2>{v.contact}</h2>
            <dl className="info-list">
              <div><dt>{v.whatsapp}</dt><dd><button type="button" className="link-button" onClick={() => openWhatsApp(t.layout.generalMessage(business.name))}>{business.phoneDisplay}</button></dd></div>
              <div><dt>{v.email}</dt><dd><a href={`mailto:${business.email}`}>{business.email}</a></dd></div>
              <div><dt>{v.instagram}</dt><dd><a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noreferrer">@{business.instagram}</a></dd></div>
            </dl>
          </div>
        </div>
        <iframe
          className="map"
          title={v.map(business.name)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(business.mapQuery)}&z=16&output=embed&hl=${t.locale.slice(0, 2)}`}
        />
      </section>

      <section className="wrap">
        <DeliveryStrip />
      </section>

      <section className="section wrap contact-section">
        <div>
          <p className="eyebrow">{v.formEyebrow}</p>
          <h2>{v.formTitle}</h2>
          <p className="lead">{v.formLead}</p>
        </div>
        <ContactForm />
      </section>

      <section className="section wrap faq">
        <h2 className="section-title">{v.faqTitle}</h2>
        <div className="faq-list">
          {v.faq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
