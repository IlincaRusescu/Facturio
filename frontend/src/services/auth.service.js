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
