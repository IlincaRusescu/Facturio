
import { randomUUID } from 'node:crypto'

import {
  createClientValidator
} from '../validators/client.validator.js'

// Verifica existenta contextului companiei
function hasCompanyAccess(user, supabase) {
  return Boolean(user?.companyId && supabase)
}

// Returneaza un rezultat de eroare standardizat
function failure(message) {
  return {
    success: false,
    errors: [message]
  }
}

// Pregateste datele comune pentru adaugare si actualizare
function prepareClientData(client) {
  return {
    name: client.name.trim(),
    cui: client.cui.trim(),
    address: client.address.trim(),
    email: client.email.trim()
  }
}

// Gestioneaza erorile de salvare si actualizare a clientilor
function handleClientError(error, defaultMessage) {
  if (error.code === '23505') {
    return failure(
      'Exista deja un client cu acest CUI in companie'
    )
  }

  return failure(defaultMessage)
}

// Creeaza un client pentru compania autentificata
export async function createClient(client, user, supabase) {
  const validation = createClientValidator(client)

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    }
  }

  if (!hasCompanyAccess(user, supabase)) {
    return failure('Autentificare necesara')
  }

  const newClient = {
    id: randomUUID(),
    company_id: user.companyId,
    ...prepareClientData(client)
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .insert(newClient)
      .select()
      .single()

    if (error) {
      return handleClientError(
        error,
        'Nu s-a putut salva clientul'
      )
    }

    return {
      success: true,
      client: data
    }
  } catch {
    return failure('Nu s-a putut salva clientul')
  }
}

// Returneaza clientii companiei autentificate
export async function getClients(user, supabase) {
  if (!hasCompanyAccess(user, supabase)) {
    return failure('Autentificare necesara')
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, company_id, name, cui, address, email')
      .eq('company_id', user.companyId)
      .order('name', { ascending: true })

    if (error) {
      return failure('Nu s-au putut incarca clientii')
    }

    return {
      success: true,
      clients: data || []
    }
  } catch {
    return failure('Nu s-au putut incarca clientii')
  }
}

// Sterge definitiv clientul companiei autentificate
export async function deleteClient(clientId, user, supabase) {
  if (!hasCompanyAccess(user, supabase)) {
    return failure('Autentificare necesara')
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
      .eq('company_id', user.companyId)
      .select('id')
      .maybeSingle()

    if (error) {
      return failure('Nu s-a putut sterge clientul')
    }

    if (!data) {
      return failure('Clientul nu a fost gasit')
    }

    return {
      success: true,
      message: 'Clientul a fost sters cu succes'
    }
  } catch {
    return failure('Nu s-a putut sterge clientul')
  }
}

// Actualizeaza datele unui client din compania autentificata
export async function updateClient(clientId, client, user, supabase) {
  const validation = createClientValidator(client)

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    }
  }

  if (!hasCompanyAccess(user, supabase)) {
    return failure('Autentificare necesara')
  }

  const updatedData = prepareClientData(client)

  try {
    const { data, error } = await supabase
      .from('clients')
      .update(updatedData)
      .eq('id', clientId)
      .eq('company_id', user.companyId)
      .select()
      .maybeSingle()

    if (error) {
      return handleClientError(
        error,
        'Nu s-a putut actualiza clientul'
      )
    }

    if (!data) {
      return failure('Clientul nu a fost gasit')
    }

    return {
      success: true,
      client: data
    }
  } catch {
    return failure('Nu s-a putut actualiza clientul')
  }
}
