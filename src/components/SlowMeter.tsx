import { useState } from 'react'
import type { CrowdLevel } from '../content'
import { useLanguage } from '../i18n/LanguageContext'
import { crowdKind, quietestWindow, type CrowdKind } from '../lib/crowd'
import { dayHours, isOpen } from '../lib/hours'
import { useClock } from '../lib/time'
import { useOwner } from '../owner/OwnerContext'

type View = 'today' | CrowdKind

const VIEWS: View[] = ['today', 'weekday', 'weekend']
/** Days whose opening hours stand in for "weekdays" and "weekends". */
const SAMPLE_DAYS: Record<CrowdKind, number[]> = { weekday: [3, 2, 4, 5, 1], weekend: [6, 0] }

/**
 * How busy the cafe usually is, hour by hour, with the slow (quiet) hours picked out.
 * In owner mode, tapping a bar cycles that hour through slow → easy → busy → packed.
 */
export default function SlowMeter({ tabs = false }: { tabs?: boolean }) {
  const now = useClock()
  const { content, editing, update } = useOwner()
  const { t } = useLanguage()
  const c = t.crowd
  const [view, setView] = useState<View>('today')

  const kind = view === 'today' ? crowdKind(now.day) : view
  const day = view === 'today' ? now.day : SAMPLE_DAYS[view].find((sample) => content.hours[sample]) ?? now.day
  const levels = content.crowd[kind]
  const slot = dayHours(content.hours, day)
  const hours: number[] = []
  if (slot) for (let hour = Math.floor(slot[0] / 60); hour * 60 < slot[1]; hour++) hours.push(hour)

  const isToday = view === 'today'
  const nowHour = isToday && isOpen(content.hours, now) ? Math.floor(now.minutes / 60) : null
  const quiet = quietestWindow(levels, hours)
  const labelEvery = hours.length > 9 ? 3 : 2

  const cycle = (hour: number) => {
    const next = ((levels[hour] + 1) % 4) as CrowdLevel
    update({ crowd: { ...content.crowd, [kind]: levels.map((level, index) => (index === hour ? next : level)) } })
  }

  return (
    <div className={`meter${editing ? ' is-editing' : ''}`}>
      {tabs && (
        <div className="tabs" role="group" aria-label={c.chartLabel}>
          {VIEWS.map((option) => (
            <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}>{c.tabs[option]}</button>
          ))}
        </div>
      )}

      {isToday && (
        <p className="meter-now">
          {nowHour !== null
            ? <><i className={`level-${levels[nowHour]}`} aria-hidden="true" />{c.now(c.levels[levels[nowHour]], c.hints[levels[nowHour]])}</>
            : c.closedNow}
        </p>
      )}

      {hours.length > 0 ? (
        <ol className="meter-chart" aria-label={c.chartLabel}>
          {hours.map((hour, index) => {
            const level = levels[hour]
            const time = t.time(hour * 60)
            const inQuiet = quiet && hour >= quiet[0] && hour < quiet[1]
            return (
              <li key={hour} className={`meter-col level-${level}${hour === nowHour ? ' is-now' : ''}${inQuiet ? ' is-quiet' : ''}`}>
                {editing
                  ? <button type="button" className="meter-bar" onClick={() => cycle(hour)} aria-label={t.owner.fields.crowd(time, c.levels[level])} />
                  : <span className="meter-bar" title={`${time}: ${c.levels[level]}`} />}
                <span className="sr-only">{time}: {c.levels[level]}</span>
                <span className="meter-hour" aria-hidden="true">{index % labelEvery === 0 ? time : ''}</span>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="meter-closed">{c.closedDay(t.days[day])}</p>
      )}

      {quiet && (
        <p className="meter-quiet">
          {(isToday ? c.quietestToday : c.quietest)(t.time(quiet[0] * 60), t.time(quiet[1] * 60))}
        </p>
      )}
      {editing && <p className="owner-tip">{t.owner.crowdTip}</p>}

      <ul className="meter-legend" aria-hidden="true">
        {c.levels.map((label, level) => <li key={label}><i className={`level-${level}`} />{label}</li>)}
      </ul>
    </div>
  )
}
