/** 14 → "RM 14", 13.5 → "RM 13.50". Ringgit reads the same in English and Malay. */
export function formatRM(value: number): string {
  return `RM ${Number.isInteger(value) ? value : value.toFixed(2)}`
}

/** Menu-board style, without the currency: 14 → "14". */
export function plainRM(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}
