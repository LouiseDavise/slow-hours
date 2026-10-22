import type { Bean, SiteContent } from '../content'
import { dayHours, nextOpening } from './hours'
import type { Clock } from './time'

// The Hourly: on the hour, every hour, the bar switches to the single origin set for that hour.

export interface Pour {
  /** 0–23; the pour runs from hour:00 to hour:59. */
  hour: number
  bean: Bean
}

export function beanFor(content: SiteContent, hour: number): Bean {
  return content.beans.find((bean) => bean.id === content.hourly[hour]) ?? content.beans[hour % content.beans.length]
}

/** Every full hour from opening until the last hour that starts before closing. */
export function poursOn(content: SiteContent, day: number): Pour[] {
  const slot = dayHours(content.hours, day)
  if (!slot) return []
  const pours: Pour[] = []
  for (let hour = Math.floor(slot[0] / 60); hour * 60 < slot[1]; hour++) pours.push({ hour, bean: beanFor(content, hour) })
  return pours
}

export interface HourlyState {
  /** Today's pours. */
  pours: Pour[]
  /** Pouring right now; null while closed. */
  current: Pour | null
  next: Pour | null
  minutesToNext: number | null
  /** Minutes into the current pour (0–59). */
  elapsed: number
  /** While closed: the first pour of the next opening. */
  firstPour: { daysAhead: number; day: number; pour: Pour } | null
}

export function hourlyState(content: SiteContent, now: Clock): HourlyState {
  const pours = poursOn(content, now.day)
  const slot = dayHours(content.hours, now.day)
  const open = !!slot && now.minutes >= slot[0] && now.minutes < slot[1]
  const hour = Math.floor(now.minutes / 60)
  const current = open ? pours.find((pour) => pour.hour === hour) ?? null : null
  const next = current ? pours.find((pour) => pour.hour === hour + 1) ?? null : null

  let firstPour: HourlyState['firstPour'] = null
  if (!current) {
    const opening = nextOpening(content.hours, now)
    const pour = opening && poursOn(content, opening.day)[0]
    if (opening && pour) firstPour = { daysAhead: opening.daysAhead, day: opening.day, pour }
  }

  return {
    pours,
    current,
    next,
    minutesToNext: next ? next.hour * 60 - now.minutes : null,
    elapsed: now.minutes % 60,
    firstPour,
  }
}
