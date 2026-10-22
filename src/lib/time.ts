import { useEffect, useState } from 'react'

// All cafe times are Malaysia time (MYT, UTC+8, no daylight saving), whatever the visitor's device
// is set to. Dates are 'YYYY-MM-DD' keys; times are minutes after midnight or "HH:MM" strings.

const MYT_OFFSET_MIN = 8 * 60
const DAY_MS = 86_400_000

export type DateKey = string

export interface Clock {
  date: DateKey
  /** 0 = Sunday … 6 = Saturday. */
  day: number
  minutes: number
}

/**
 * `?at=2026-10-24T15:20` (Malaysia time) starts the site's clock there and lets it run on, handy
 * for checking a closed day or recording the hourly board at a set time.
 */
const simulatedOffset = (() => {
  const at = new URLSearchParams(window.location.search).get('at')
  const target = at ? Date.parse(`${at}+08:00`) : NaN
  return Number.isNaN(target) ? 0 : target - Date.now()
})()

export function nowMYT(): Clock {
  const shifted = new Date(Date.now() + simulatedOffset + MYT_OFFSET_MIN * 60_000)
  return { date: shifted.toISOString().slice(0, 10), day: shifted.getUTCDay(), minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes() }
}

/** The Malaysia clock, refreshed every 15 seconds. */
export function useClock(): Clock {
  const [now, setNow] = useState(nowMYT)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(nowMYT()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

function utc(date: DateKey): Date {
  return new Date(`${date}T00:00:00Z`)
}

export function addDays(date: DateKey, days: number): DateKey {
  return new Date(utc(date).getTime() + days * DAY_MS).toISOString().slice(0, 10)
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(date: DateKey): number {
  return utc(date).getUTCDay()
}

/** "09:30" → 570. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function formatDate(date: DateKey, locale: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(utc(date))
}

export function formatStamp(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur' }).format(new Date(iso))
}
