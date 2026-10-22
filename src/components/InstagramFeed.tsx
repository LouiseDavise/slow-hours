import { INSTAGRAM } from '../catalog'
import { business } from '../config'
import { useLanguage } from '../i18n/LanguageContext'

const profile = `https://instagram.com/${business.instagram}`

/** Instagram feed add-on. The live site pulls the latest posts from the cafe's account; the demo shows a fixed set. */
export default function InstagramFeed() {
  const { t, pick } = useLanguage()
  return (
    <section className="section wrap insta">
      <div className="section-head">
        <div>
          <p className="eyebrow">{t.home.instaEyebrow}</p>
          <h2>@{business.instagram}</h2>
        </div>
        <a className="btn btn-line" href={profile} target="_blank" rel="noreferrer">{t.home.instaFollow}</a>
      </div>
      <ul className="insta-grid">
        {INSTAGRAM.map((post) => (
          <li key={post.src}>
            <a href={profile} target="_blank" rel="noreferrer">
              <img src={post.src} alt={pick(post.caption)} loading="lazy" />
              <span className="insta-caption">{pick(post.caption)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
