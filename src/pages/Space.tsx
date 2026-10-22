import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GALLERY } from '../catalog'
import Modal from '../components/Modal'
import SlowMeter from '../components/SlowMeter'
import { useLanguage } from '../i18n/LanguageContext'

export default function Space() {
  const { t, pick } = useLanguage()
  const s = t.space
  const [open, setOpen] = useState<number | null>(null)
  const photo = open === null ? null : GALLERY[open]
  const step = (by: number) => setOpen((current) => (current === null ? null : (current + by + GALLERY.length) % GALLERY.length))

  // Arrow keys flip through the lightbox.
  useEffect(() => {
    if (open === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') step(-1)
      if (event.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <section className="page-head wrap">
        <p className="eyebrow">{s.eyebrow}</p>
        <h1>{s.title}</h1>
        <p className="lead">{s.lead}</p>
      </section>

      <section className="section wrap section-tight">
        <ol className="principles">
          {s.principles.map((principle, index) => (
            <li key={principle.title}>
              <span className="principle-no">{String(index + 1).padStart(2, '0')}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="band-tint">
        <div className="wrap slow-feature">
          <div className="slow-copy">
            <p className="eyebrow">{t.home.slowEyebrow}</p>
            <h2>{t.crowd.title}</h2>
            <p>{t.crowd.lead}</p>
          </div>
          <SlowMeter tabs />
        </div>
      </section>

      <section className="section wrap">
        <p className="eyebrow">{s.galleryEyebrow}</p>
        <h2 className="section-title">{s.galleryTitle}</h2>
        <div className="masonry">
          {GALLERY.map((item, index) => (
            <figure key={item.src} className={item.tall ? 'tall' : undefined}>
              <button type="button" onClick={() => setOpen(index)} aria-label={pick(item.caption)}>
                <img src={item.src} alt={pick(item.caption)} loading="lazy" />
              </button>
              <figcaption>{pick(item.caption)}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section wrap space-bottom">
        <div>
          <h2>{s.amenitiesTitle}</h2>
          <ul className="ticks">
            {s.amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}
          </ul>
        </div>
        <div className="cta-card">
          <h2>{s.ctaTitle}</h2>
          <p>{s.ctaText}</p>
          <Link className="btn btn-light" to="/reserve">{s.cta}</Link>
        </div>
      </section>

      {photo && (
        <Modal label={pick(photo.caption)} onClose={() => setOpen(null)} className="lightbox-card">
          <figure className="lightbox">
            <img src={photo.src} alt={pick(photo.caption)} />
            <figcaption>{pick(photo.caption)}</figcaption>
          </figure>
          <div className="modal-actions">
            <button type="button" className="btn btn-quiet" aria-label={t.common.previous} onClick={() => step(-1)}>←</button>
            <button type="button" className="btn btn-quiet" aria-label={t.common.next} onClick={() => step(1)}>→</button>
            <button type="button" className="btn btn-line" onClick={() => setOpen(null)}>{t.common.close}</button>
          </div>
        </Modal>
      )}
    </>
  )
}
