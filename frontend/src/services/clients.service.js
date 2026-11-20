const API_URL = 'http://localhost:3000/api/clients'

function getToken() {
  return sessionStorage.getItem(
    'facturio_access_token'
  )
}

async function requestClients(path = '', options = {}) {
  const token = getToken()

  if (!token) {
    throw new Error('Autentificare necesara')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(
      result.errors?.join(', ') ||
      result.message ||
      'A aparut o eroare'
    )
  }

  return result
}

export async function fetchClients() {
  return requestClients()
}

export async function addClient(client) {
  return requestClients('', {
    method: 'POST',
    body: JSON.stringify(client)
  })
}

export async function deleteClient(clientId) {
  return requestClients(`/${encodeURIComponent(clientId)}`, {
    method: 'DELETE'
  })
}


// Actualizeaza datele unui client existent
export async function updateClient(clientId, client) {
  return requestClients(
    `/${encodeURIComponent(clientId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(client)
    }
  )
}
