const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function createClientValidator(client = {}) {
  const errors = []

  if (!client.name?.trim()) {
    errors.push('Denumirea clientului este obligatorie')
  }

  if (!client.cui?.trim()) {
    errors.push('CUI-ul este obligatoriu')
  }

  if (!client.address?.trim()) {
    errors.push('Adresa este obligatorie')
  }

  if (!client.email?.trim()) {
    errors.push('Adresa de email este obligatorie')
  } else if (!EMAIL_REGEX.test(client.email.trim())) {
    errors.push('Adresa de email este invalida')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
