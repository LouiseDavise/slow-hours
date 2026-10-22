import { Link } from 'react-router-dom'
import { MENU_SECTIONS, type MenuItem } from '../content'
import { DeliveryStrip } from '../components/FormBits'
import { BeanCards, HourlyBoard, NowPouring } from '../components/Hourly'
import { useLanguage } from '../i18n/LanguageContext'
import { formatRM, plainRM } from '../lib/money'
import { EditablePrice, EditableText, SoldOutToggle } from '../owner/fields'
import { useOwner } from '../owner/OwnerContext'

function MenuRow({ item, twoPrices }: { item: MenuItem; twoPrices: boolean }) {
  const { updateEntry, localize } = useOwner()
  const { t, pick } = useLanguage()
  const f = t.owner.fields
  const name = pick(item.name)
  return (
    <li className={`menu-item${item.soldOut ? ' is-sold-out' : ''}`}>
      <div className="menu-item-text">
        <h3>
          <EditableText value={name} onChange={(value) => updateEntry('menu', item.id, { name: localize(item.name, value) })} label={f.name} />
          {item.tag && <span className="tag">{t.tags[item.tag]}</span>}
          {item.soldOut && <span className="tag tag-out">{t.common.soldOut}</span>}
        </h3>
        <p><EditableText multiline value={pick(item.note)} onChange={(value) => updateEntry('menu', item.id, { note: localize(item.note, value) })} label={`${f.note}: ${name}`} /></p>
        <SoldOutToggle value={item.soldOut} onChange={(soldOut) => updateEntry('menu', item.id, { soldOut })} />
      </div>
      <span className="menu-price">
        {twoPrices && <span className="sr-only">{t.common.hot}: </span>}
        {item.price !== null
          ? <EditablePrice plain value={item.price} onChange={(price) => updateEntry('menu', item.id, { price })} label={`${f.price}: ${name}`} />
          : <span aria-hidden="true">–</span>}
      </span>
      {twoPrices && (
        <span className="menu-price">
          <span className="sr-only">{t.common.iced}: </span>
          {item.iced !== null
            ? <EditablePrice plain value={item.iced} onChange={(iced) => updateEntry('menu', item.id, { iced })} label={`${f.iced}: ${name}`} />
            : <span aria-hidden="true">–</span>}
        </span>
      )}
    </li>
  )
}

export default function Menu() {
  const { content, editing, update } = useOwner()
  const { t, pick } = useLanguage()
  const m = t.menu
  const jumps = [
    { id: 'hourly', label: t.hourly.name },
    ...MENU_SECTIONS.map((section) => ({ id: section, label: m.sections[section] })),
    { id: 'cakes', label: m.cakes },
  ]
  const slices = content.cakes.filter((cake) => cake.slice !== null)

  return (
    <>
      <section className="page-head wrap">
        <p className="eyebrow">{m.eyebrow}</p>
        <h1>{m.title}</h1>
        <p className="lead">{m.lead}</p>
        <nav className="chips" aria-label={m.jump}>
          {jumps.map((jump) => <Link key={jump.id} to={`#${jump.id}`}>{jump.label}</Link>)}
        </nav>
      </section>

      <section id="hourly" className="band-dark anchor">
        <div className="wrap hourly-menu">
          <div className="hourly-menu-head">
            <div>
              <p className="eyebrow">{t.hourly.name}</p>
              <h2>{t.hourly.title}</h2>
              <p className="lead">{t.hourly.lead(formatRM(content.hourlyPrice))}</p>
            </div>
            <p className="hourly-price">
              <EditablePrice value={content.hourlyPrice} onChange={(hourlyPrice) => update({ hourlyPrice })} label={t.owner.fields.hourlyPrice} />
              <span>{t.hourly.perCup}</span>
            </p>
          </div>
          {editing && <p className="owner-tip">{t.owner.hourlyTip}</p>}
          <div className="hourly-grid">
            <NowPouring />
            <HourlyBoard />
          </div>
          <div className="beans-head">
            <h3>{t.hourly.beans}</h3>
            <p>{t.hourly.beansLead}</p>
          </div>
          <BeanCards />
        </div>
      </section>

      {editing && <p className="wrap owner-tip owner-tip-top">{t.owner.menuTip}</p>}

      {MENU_SECTIONS.map((section) => {
        const items = content.menu.filter((item) => item.section === section)
        const twoPrices = items.some((item) => item.iced !== null)
        return (
          <section key={section} id={section} className="section wrap menu-section anchor">
            <div className="menu-section-head">
              <h2>{m.sections[section]}</h2>
              <p>{m.sectionNotes[section]}</p>
            </div>
            <div>
              {twoPrices && (
                <div className="menu-cols" aria-hidden="true">
                  <span>{t.common.hot}</span>
                  <span>{t.common.iced}</span>
                </div>
              )}
              <ul className={`menu-items${twoPrices ? ' two-prices' : ''}`}>
                {items.map((item) => <MenuRow key={item.id} item={item} twoPrices={twoPrices} />)}
              </ul>
            </div>
          </section>
        )
      })}

      <section id="cakes" className="section wrap menu-section anchor">
        <div className="menu-section-head">
          <h2>{m.cakes}</h2>
          <p>{m.cakesNote}</p>
          <Link className="link-arrow" to="/cakes">{m.cakesCta} <span aria-hidden="true">→</span></Link>
        </div>
        <ul className="menu-items">
          {slices.map((cake) => (
            <li key={cake.id} className={`menu-item${cake.soldOut ? ' is-sold-out' : ''}`}>
              <div className="menu-item-text">
                <h3>
                  {pick(cake.name)}
                  {cake.tag && <span className="tag">{t.tags[cake.tag]}</span>}
                  {cake.soldOut && <span className="tag tag-out">{t.common.soldOut}</span>}
                </h3>
                <p>{pick(cake.note)}</p>
              </div>
              <span className="menu-price">{plainRM(cake.slice!)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap">
        <DeliveryStrip />
        <p className="dietary">{m.dietary}</p>
      </section>
    </>
  )
}
