import { Link } from 'react-router-dom'
import { business, mapsLink } from '../config'
import CakeCard from '../components/CakeCard'
import { NowPouring } from '../components/Hourly'
import InstagramFeed from '../components/InstagramFeed'
import OpenStatus from '../components/OpenStatus'
import SlowMeter from '../components/SlowMeter'
import { useWhatsApp, WhatsAppIcon } from '../components/WhatsApp'
import { useLanguage } from '../i18n/LanguageContext'
import { hourlyState } from '../lib/hourly'
import { dayHours } from '../lib/hours'
import { formatRM } from '../lib/money'
import { useClock } from '../lib/time'
import { EditablePhoto, EditableText } from '../owner/fields'
import { useOwner } from '../owner/OwnerContext'

/** Cakes shown on the home page, in this order. */
const FEATURED_CAKES = ['gula-melaka', 'tiramisu', 'cheesecake', 'yuzu-tart']

export default function Home() {
  const { content, update, updateText } = useOwner()
  const { t, pick } = useLanguage()
  const now = useClock()
  const openWhatsApp = useWhatsApp()
  const h = t.home
  const pouring = hourlyState(content, now).current
  const today = dayHours(content.hours, now.day)
  const featured = FEATURED_CAKES.map((id) => content.cakes.find((cake) => cake.id === id)).filter((cake) => !!cake)

  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <OpenStatus />
          <h1><EditableText multiline value={pick(content.headline)} onChange={(value) => updateText('headline', value)} label={t.owner.fields.headline} /></h1>
          <p className="lead"><EditableText multiline value={pick(content.lead)} onChange={(value) => updateText('lead', value)} label={t.owner.fields.lead} /></p>
          <div className="ctas">
            <Link className="btn btn-dark" to="/reserve">{h.reserve}</Link>
            <Link className="btn btn-line" to="/menu#hourly">{h.seePours}</Link>
          </div>
        </div>
        <div className="hero-media">
          <EditablePhoto className="arch" src={content.heroPhoto} alt={h.heroAlt} loading="eager" onChange={(heroPhoto) => update({ heroPhoto })} />
          {pouring && (
            <Link to="/menu#hourly" className="hero-chip">
              <span className="live-dot is-live" aria-hidden="true" />
              <span>{h.pouringNow}<b>{pouring.bean.name}</b></span>
            </Link>
          )}
        </div>
      </section>

      <section className="band-dark">
        <div className="wrap hourly-feature">
          <div className="hourly-copy">
            <p className="eyebrow">{t.hourly.name}</p>
            <h2>{t.hourly.title}</h2>
            <p className="lead">{t.hourly.lead(formatRM(content.hourlyPrice))}</p>
            <NowPouring />
            <Link to="/menu#hourly" className="link-arrow">{t.hourly.fullBoard} <span aria-hidden="true">→</span></Link>
          </div>
          <div className="photo hourly-photo"><img src="/images/hourly.jpg" alt={h.hourlyAlt} loading="lazy" /></div>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">{h.cakesEyebrow}</p>
            <h2>{h.cakesTitle}</h2>
            <p className="lead">{h.cakesLead}</p>
          </div>
          <Link className="btn btn-line" to="/cakes">{h.cakesCta}</Link>
        </div>
        <div className="cake-grid">
          {featured.map((cake) => <CakeCard key={cake.id} cake={cake} />)}
        </div>
      </section>

      <section className="band-tint">
        <div className="wrap slow-feature">
          <div className="slow-copy">
            <p className="eyebrow">{h.slowEyebrow}</p>
            <h2>{h.slowTitle}</h2>
            <p>{h.slowText}</p>
            <Link className="link-arrow" to="/space">{h.slowCta} <span aria-hidden="true">→</span></Link>
          </div>
          <SlowMeter />
        </div>
      </section>

      <section className="section wrap story">
        <div className="photo story-photo"><img src="/images/bar.jpg" alt={h.storyAlt} loading="lazy" /></div>
        <div className="story-copy">
          <p className="eyebrow">{h.storyEyebrow}</p>
          <h2>{h.storyTitle}</h2>
          <p>{h.storyText}</p>
          <p className="signature">{h.storySign}</p>
        </div>
      </section>

      <InstagramFeed />

      <section className="wrap">
        <div className="visit-band">
          <div>
            <p className="eyebrow">{h.visitEyebrow}</p>
            <h2>{h.visitTitle}</h2>
            <p>{business.address}</p>
            <p className="visit-today">{today ? h.today(`${t.time(today[0])} – ${t.time(today[1])}`) : h.closedToday}</p>
          </div>
          <div className="ctas">
            <a className="btn btn-light" href={mapsLink} target="_blank" rel="noreferrer">{h.directions}</a>
            <button type="button" className="btn btn-line-light" onClick={() => openWhatsApp(t.layout.generalMessage(business.name))}><WhatsAppIcon />{h.chat}</button>
          </div>
        </div>
      </section>
    </>
  )
}
