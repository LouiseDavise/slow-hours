// Fixed business details and booking rules. Content the owner can change (menu, cakes, hours, the
// hourly rotation…) lives in content.ts.

export const business = {
  name: 'Slow Hours',
  tagline: 'Coffee & Cake',
  /**
   * Fictional STOEDIO demo: shows the "Demo by STOEDIO" strip and WhatsApp buttons preview the
   * message instead of opening it. Set to false (and fill in `whatsapp`) for a real cafe.
   */
  demo: true,
  whatsapp: '', // international format without "+", e.g. '60123456789'
  phoneDisplay: '+60 12-000 7700',
  email: 'hello@slowhours.my',
  instagram: 'slowhours.kl',
  address: '23, Jalan Tun Mohd Fuad 3, Taman Tun Dr Ismail, 60000 Kuala Lumpur',
  mapQuery: 'Jalan Tun Mohd Fuad 3, Taman Tun Dr Ismail, Kuala Lumpur',
  founded: 2023,
  /** Delivery app store pages. Empty hides the button. */
  delivery: {
    grab: 'https://food.grab.com/my/en/',
    foodpanda: 'https://www.foodpanda.my/',
  },
} as const

export const reservationRules = {
  /** Time slots every this many minutes. */
  step: 30,
  /** Last table starts this long before closing. */
  lastSeatingMinutes: 60,
  /** Same-day requests need this much notice. */
  minNoticeMinutes: 60,
  maxDaysAhead: 30,
  maxGuests: 10,
  /** We hold a table this long for late arrivals. */
  holdMinutes: 15,
  /** Weekend tables are this long when there's a queue. */
  weekendTableMinutes: 90,
} as const

export const cakeOrderRules = {
  /** Whole cakes need this many days' notice. */
  minDaysAhead: 2,
  maxDaysAhead: 30,
  /** Characters on the chocolate plaque. */
  messageMax: 30,
  /** Size of a whole cake (the price on the menu). */
  size: 8,
} as const

export const stoedio = {
  url: 'https://stoedio.com',
  whatsapp: '6282160562558',
  instagram: 'stoedioofficial',
} as const

export function waLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.mapQuery)}`
