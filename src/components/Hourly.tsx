import type { Bean } from '../content'
import { useLanguage } from '../i18n/LanguageContext'
import { hourlyState, poursOn } from '../lib/hourly'
import { nextOpening } from '../lib/hours'
import { useClock } from '../lib/time'
import { EditableText } from '../owner/fields'
import { useOwner } from '../owner/OwnerContext'
import { relativeDay } from './OpenStatus'

function BeanSummary({ bean }: { bean: Bean }) {
  const { t, pick } = useLanguage()
  return (
    <>
      <h3 className="pour-bean">{bean.name}</h3>
      <p className="pour-meta">{pick(bean.origin)} · {pick(bean.process)} · {t.hourly.method} {bean.method}</p>
      <ul className="notes">
        {pick(bean.notes).split(',').map((note) => note.trim()).filter(Boolean).map((note) => <li key={note}>{note}</li>)}
      </ul>
    </>
  )
}

/** Live card: what's pouring this hour, how far into the hour we are, and what's next. */
export function NowPouring() {
  const now = useClock()
  const { content } = useOwner()
  const { t } = useLanguage()
  const h = t.hourly
  const state = hourlyState(content, now)

  if (!state.current) {
    const first = state.firstPour
    return (
      <div className="pour-card is-closed">
        <p className="pour-eyebrow"><span className="live-dot" aria-hidden="true" />{h.closed}</p>
        {first && (
          <>
            <p className="pour-when">{h.firstPour(relativeDay(t, first.daysAhead, first.day), t.time(first.pour.hour * 60))}</p>
            <BeanSummary bean={first.pour.bean} />
          </>
        )}
      </div>
    )
  }

  return (
    <div className="pour-card" aria-live="polite">
      <p className="pour-eyebrow"><span className="live-dot is-live" aria-hidden="true" />{h.nowPouring(t.time(state.current.hour * 60))}</p>
      <BeanSummary bean={state.current.bean} />
      <div className="pour-progress" role="progressbar" aria-valuemin={0} aria-valuemax={60} aria-valuenow={state.elapsed} aria-label={h.progress(state.elapsed)}>
        <span style={{ width: `${(state.elapsed / 60) * 100}%` }} />
      </div>
      <p className="pour-next">
        {state.next && state.minutesToNext !== null
          ? <>{h.nextIn(state.minutesToNext)}: <b>{state.next.bean.name}</b></>
          : h.lastPour}
      </p>
    </div>
  )
}

/** Today's pours hour by hour (or the next open day's, on a closed day). The owner picks each hour's coffee. */
export function HourlyBoard() {
  const now = useClock()
  const { content, editing, update } = useOwner()
  const { t, pick } = useLanguage()
  const h = t.hourly
  const state = hourlyState(content, now)

  let pours = state.pours
  let heading = h.board
  const isToday = pours.length > 0
  if (!isToday) {
    const opening = nextOpening(content.hours, now)
    if (opening) {
      pours = poursOn(content, opening.day)
      heading = h.boardClosed(t.days[opening.day])
    }
  }
  const nowHour = Math.floor(now.minutes / 60)

  return (
    <div className={`board${editing ? ' is-editing' : ''}`}>
      <p className="board-title">{heading}</p>
      <ol className="board-rows">
        {pours.map((pour) => {
          const isNow = state.current?.hour === pour.hour
          const past = isToday && !isNow && pour.hour < nowHour
          const time = t.time(pour.hour * 60)
          return (
            <li key={pour.hour} className={isNow ? 'is-now' : past ? 'is-past' : undefined}>
              <span className="board-time">{time}</span>
              <span className="board-bean">
                {editing ? (
                  <select
                    className="owner-field owner-select"
                    value={pour.bean.id}
                    aria-label={t.owner.fields.bean(time)}
                    onChange={(event) => update({ hourly: { ...content.hourly, [pour.hour]: event.target.value } })}
                  >
                    {content.beans.map((bean) => <option key={bean.id} value={bean.id}>{bean.name}</option>)}
                  </select>
                ) : pour.bean.name}
              </span>
              <span className="board-origin">{pick(pour.bean.origin)}</span>
              <span className="board-notes">{pick(pour.bean.notes)}</span>
              {isNow && <em className="board-now">{h.now}</em>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** The six single origins on rotation; owner mode edits the tasting notes. */
export function BeanCards() {
  const { content, updateEntry, localize } = useOwner()
  const { t, pick } = useLanguage()
  return (
    <ul className="beans">
      {content.beans.map((bean) => (
        <li key={bean.id} className="bean-card">
          <p className="bean-origin">{pick(bean.origin)}</p>
          <h3>{bean.name}</h3>
          <p className="bean-meta">{pick(bean.process)} · {bean.method}</p>
          <p className="bean-notes">
            <EditableText value={pick(bean.notes)} onChange={(value) => updateEntry('beans', bean.id, { notes: localize(bean.notes, value) })} label={`${t.owner.fields.notes}: ${bean.name}`} />
          </p>
        </li>
      ))}
    </ul>
  )
}
