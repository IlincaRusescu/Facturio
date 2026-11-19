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
    name: client.name.trim(),
    cui: client.cui.trim(),
    address: client.address.trim(),
    email: client.email.trim()
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .insert(newClient)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return failure(
          'Exista deja un client cu acest CUI in companie'
        )
      }

      return failure('Nu s-a putut salva clientul')
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

