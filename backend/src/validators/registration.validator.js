const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function validateRegistration(data) {
  const errors = []

  const {
    firstName,
    lastName,
    email,
    password,
    companyId
  } = data

  const firstNameValue = firstName?.trim()
  const lastNameValue = lastName?.trim()
  const emailValue = email?.trim()
  const companyIdValue = companyId?.trim()

  // Validarea campurilor obligatorii
  if (!firstNameValue) {
    errors.push('Prenumele este obligatoriu')
  }

  if (!lastNameValue) {
    errors.push('Numele este obligatoriu')
  }

  // Validarea adresei de e-mail
  if (!emailValue) {
    errors.push('Adresa de email este obligatorie')
  } else if (!EMAIL_REGEX.test(emailValue)) {
    errors.push('Adresa de email este invalida')
  }

  // Validarea parolei
  if (!password) {
    errors.push('Parola este obligatorie')
  } else if (password.length < 8) {
    errors.push('Parola trebuie sa aiba minimum 8 caractere')
  }

  // Validarea companiei
  if (!companyIdValue) {
    errors.push('Selectarea companiei este obligatorie')
  } else if (!UUID_REGEX.test(companyIdValue)) {
    errors.push('Identificatorul companiei este invalid')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
