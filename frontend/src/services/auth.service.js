import { getAccessToken } from './session.service.js'
const API_URL = 'http://localhost:3000/api/auth'

// Preluarea companiilor din Supabase
export async function getRegistrationCompanies() {
  const response = await fetch(`${API_URL}/companies`)
  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || 'Nu s-au putut incarca companiile.'
    )
  }

  return result.companies
}

// Trimiterea formularului de inregistrare catre backend
export async function registerUser(formData) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(
      result.errors?.join('\n') ||
      result.message ||
      'Inregistrarea nu a putut fi finalizata.'
    )
  }

  
  return result
}



export async function loginUser(credentials) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    const message = result.errors?.[0] || result.message

    if (message === 'Invalid login credentials') {
      throw new Error(
        'Adresa de e-mail sau parola este incorecta.'
      )
    }

    throw new Error(
      message || 'Autentificarea a esuat. Incearca din nou.'
    )
  }

  return result
}


export async function getCurrentUser() {
  const token = getAccessToken()

  if (!token) {
    throw new Error('Nu exista o sesiune activa.')
  }

  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || 'Sesiune invalida.'
    )
  }

  return result
}

