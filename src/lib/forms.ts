/** Malaysian numbers: 012-345 6789, +60 12-345 6789, 03-7700 1234… (9 to 13 digits). */
export function isPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '').length
  return digits >= 9 && digits <= 13
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
