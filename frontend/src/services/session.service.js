const TOKEN_KEY = 'facturio_access_token'

export function saveSession(session) {
  if (!session?.access_token) {
    throw new Error('Sesiune invalida')
  }

  sessionStorage.setItem(
    TOKEN_KEY,
    session.access_token
  )
}

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export function hasSession() {
  return Boolean(getAccessToken())
}
