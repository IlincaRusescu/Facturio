 // FACTURIO - US-06 - REFACTOR
// Functii reutilizabile pentru formatarea facturilor PDF

// Formateaza valorile financiare la doua zecimale
export function money(value) {
  return Number(value).toFixed(2)
}

// Transforma data din YYYY-MM-DD in DD.MM.YYYY
export function formatDate(value) {
  if (!value) return '-'

  const [year, month, day] = value.split('-')
  return `${day}.${month}.${year}`
}

// Converteste valorile lipsa intr-un text implicit
export function safeText(value) {
  return String(value ?? '-')
}

// Limiteaza lungimea textului pentru incadrarea in PDF
export function shortText(value, maxLength = 45) {
  const text = safeText(value)

  return text.length > maxLength
    ? text.slice(0, maxLength - 3) + '...'
    : text
}
