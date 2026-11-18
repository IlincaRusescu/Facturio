export function validateRegistration(data) {
  const errors = []

  const firstName = data.firstName?.trim()
  const lastName = data.lastName?.trim()
  const email = data.email?.trim()
  const password = data.password
  const companyId = data.companyId?.trim()

  // Validare prenume
  if (!firstName) {
    errors.push('Prenumele este obligatoriu')
  }

  // Validare nume
  if (!lastName) {
    errors.push('Numele este obligatoriu')
  }

  // Validare email
  if (!email) {
    errors.push('Adresa de email este obligatorie')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Adresa de email este invalida')
  }

  // Validare parola
  if (!password) {
    errors.push('Parola este obligatorie')
  } else if (password.length < 8) {
    errors.push('Parola trebuie sa aiba minimum 8 caractere')
  }

  // Validare companie
  if (!companyId) {
    errors.push('Selectarea companiei este obligatorie')
  } else if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(companyId)
  ) {
    errors.push('Identificatorul companiei este invalid')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
