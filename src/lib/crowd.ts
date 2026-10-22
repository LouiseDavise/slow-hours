import type { CrowdLevel, SiteContent } from '../content'

export type CrowdKind = 'weekday' | 'weekend'

/** Saturday and Sunday follow the weekend pattern. */
export function crowdKind(day: number): CrowdKind {
  return day === 0 || day === 6 ? 'weekend' : 'weekday'
}

export function crowdLevel(content: SiteContent, day: number, hour: number): CrowdLevel {
  return content.crowd[crowdKind(day)][hour] ?? 0
}

/** The longest run of the quietest level among `hours`, as [first hour, end hour). */
export function quietestWindow(levels: CrowdLevel[], hours: number[]): [number, number] | null {
  if (!hours.length) return null
  const lowest = Math.min(...hours.map((hour) => levels[hour] ?? 0))
  let best: [number, number] | null = null
  let start: number | null = null
  let previous: number | null = null
  for (const hour of hours) {
    if ((levels[hour] ?? 0) !== lowest) start = null
    else {
      if (start === null || previous !== hour - 1) start = hour
      if (!best || hour + 1 - start > best[1] - best[0]) best = [start, hour + 1]
    }
    previous = hour
  }
  return best
}
