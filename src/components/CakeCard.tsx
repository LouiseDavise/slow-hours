import { cakeOrderRules } from '../config'
import type { Cake } from '../content'
import { useLanguage } from '../i18n/LanguageContext'
import { EditablePhoto, EditablePrice, EditableText, SoldOutToggle } from '../owner/fields'
import { useOwner } from '../owner/OwnerContext'

/** A cake with its photo, slice and whole prices. `onOrder` adds the "Order whole" link. */
export default function CakeCard({ cake, onOrder }: { cake: Cake; onOrder?: (id: string) => void }) {
  const { editing, updateEntry, localize } = useOwner()
  const { t, pick } = useLanguage()
  const f = t.owner.fields
  const name = pick(cake.name)

  return (
    <article className={`cake-card${cake.soldOut ? ' is-sold-out' : ''}`}>
      <div className="cake-media">
        <EditablePhoto className="cake-photo" src={cake.photo} alt={name} loading="lazy" onChange={(photo) => updateEntry('cakes', cake.id, { photo })} />
        <div className="cake-badges">
          {cake.tag && <span className="tag">{t.tags[cake.tag]}</span>}
          {cake.soldOut && <span className="tag tag-out">{t.common.soldOut}</span>}
        </div>
      </div>
      <h3><EditableText value={name} onChange={(value) => updateEntry('cakes', cake.id, { name: localize(cake.name, value) })} label={f.name} /></h3>
      <p className="cake-note"><EditableText multiline value={pick(cake.note)} onChange={(value) => updateEntry('cakes', cake.id, { note: localize(cake.note, value) })} label={`${f.note}: ${name}`} /></p>
      <dl className="cake-prices">
        {cake.slice !== null && (
          <div>
            <dt>{t.common.slice}</dt>
            <dd><EditablePrice value={cake.slice} onChange={(slice) => updateEntry('cakes', cake.id, { slice })} label={`${f.slice}: ${name}`} /></dd>
          </div>
        )}
        {cake.whole !== null && (
          <div>
            <dt>{t.common.whole(cakeOrderRules.size)}</dt>
            <dd><EditablePrice value={cake.whole} onChange={(whole) => updateEntry('cakes', cake.id, { whole })} label={`${f.whole}: ${name}`} /></dd>
          </div>
        )}
      </dl>
      <SoldOutToggle value={cake.soldOut} onChange={(soldOut) => updateEntry('cakes', cake.id, { soldOut })} />
      {onOrder && cake.whole !== null && !editing && (
        <button type="button" className="link-arrow" onClick={() => onOrder(cake.id)}>{t.cakes.order} <span aria-hidden="true">→</span></button>
      )}
    </article>
  )
}
