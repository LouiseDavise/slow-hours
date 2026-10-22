import type { OpeningHours } from '../content'
import { addDays, toMinutes, weekday, type Clock, type DateKey } from './time'

/** A day's opening and closing time in minutes, or null when closed. */
export function dayHours(hours: OpeningHours, day: number): [number, number] | null {
  const slot = hours[day]
  return slot ? [toMinutes(slot[0]), toMinutes(slot[1])] : null
}

export function isOpen(hours: OpeningHours, now: Clock): boolean {
  const today = dayHours(hours, now.day)
  return !!today && now.minutes >= today[0] && now.minutes < today[1]
}

/** When the cafe next opens after `now`: later today or on a following day. */
export function nextOpening(hours: OpeningHours, now: Clock): { daysAhead: number; day: number; minutes: number } | null {
  for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
    const day = (now.day + daysAhead) % 7
    const slot = dayHours(hours, day)
    if (slot && (daysAhead > 0 || now.minutes < slot[0])) return { daysAhead, day, minutes: slot[0] }
  }
  return null
}

/** The first date from `from` on that has at least one slot (see `timeSlots`). */
export function firstOpenDate(hours: OpeningHours, from: DateKey, now: Clock, rules: SlotRules): DateKey {
  for (let ahead = 0; ahead < 14; ahead++) {
    const date = addDays(from, ahead)
    if (timeSlots(hours, date, now, rules).length) return date
  }
  return from
}

export interface SlotRules {
  step: number
  /** Last start this many minutes before closing. */
  endBefore: number
  /** Same-day starts need this many minutes' notice. */
  notice: number
}

/**
 * Start times on `date`, every `step` minutes from opening until `endBefore` minutes before
 * closing. On today's date, only times at least `notice` minutes from now.
 */
export function timeSlots(hours: OpeningHours, date: DateKey, now: Clock, rules: SlotRules): number[] {
  const slot = dayHours(hours, weekday(date))
  if (!slot) return []
  const earliest = date === now.date ? now.minutes + rules.notice : 0
  const slots: number[] = []
  for (let minutes = slot[0]; minutes <= slot[1] - rules.endBefore; minutes += rules.step) {
    if (minutes >= earliest) slots.push(minutes)
  }
  return slots
}
