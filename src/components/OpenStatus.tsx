import { useLanguage } from '../i18n/LanguageContext'
import type { Strings } from '../i18n/strings'
import { dayHours, isOpen, nextOpening } from '../lib/hours'
import { useClock } from '../lib/time'
import { useOwner } from '../owner/OwnerContext'

/** "today", "tomorrow" or the weekday name. */
export function relativeDay(t: Strings, daysAhead: number, day: number): string {
  return daysAhead === 0 ? t.common.today : daysAhead === 1 ? t.common.tomorrow : t.days[day]
}

/** "Open now · until 10pm" or "Closed · opens tomorrow 9am". */
export default function OpenStatus({ className = '' }: { className?: string }) {
  const now = useClock()
  const { t } = useLanguage()
  const { content } = useOwner()
  const open = isOpen(content.hours, now)

  let label: string = t.status.closed
  if (open) label = t.status.openUntil(t.time(dayHours(content.hours, now.day)![1]))
  else {
    const next = nextOpening(content.hours, now)
    if (next) label = t.status.closedOpens(relativeDay(t, next.daysAhead, next.day), t.time(next.minutes))
  }

  return (
    <span className={`open-status ${open ? 'is-open' : 'is-closed'} ${className}`}>
      <i aria-hidden="true" />{label}
    </span>
  )
}
