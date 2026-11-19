import { Router } from 'express'

import {
  createSupabaseClient
} from '../config/supabase.js'

import {
  createRequireAuth
} from '../middleware/auth.middleware.js'

import {
  createClient,
  getClients,
  deleteClient
} from '../services/clients.service.js'

const router = Router()


// Determina codul HTTP pentru erorile de adaugare client
function getErrorStatus(errors = []) {
  if (errors.includes('Autentificare necesara')) {
    return 401
  }

  if (errors.some(error => error.includes('acest CUI'))) {
    return 409
  }

  const validationErrors = [
    'Denumirea clientului este obligatorie',
    'CUI-ul este obligatoriu',
    'Adresa este obligatorie',
    'Adresa de email este obligatorie',
    'Adresa de email este invalida'
  ]

  if (errors.some(error => validationErrors.includes(error))) {
    return 400
  }

  return 500
}


// Client Supabase pentru validarea tokenului
const supabase = createSupabaseClient()

// Toate rutele necesita autentificare
router.use(createRequireAuth(supabase))

// GET /api/clients - Lista clientilor companiei
router.get('/', async (req, res) => {
  const result = await getClients(
    req.user,
    req.supabase
  )

  if (!result.success) {
    return res.status(500).json(result)
  }

  return res.status(200).json(result)
})

// POST /api/clients - Adaugare client
router.post('/', async (req, res) => {
  const result = await createClient(
    req.body,
    req.user,
    req.supabase
  )

  if (!result.success) {
  const status = getErrorStatus(result.errors)

  return res.status(status).json(result)
}

  return res.status(201).json(result)
})


// DELETE /api/clients/:id - Stergere definitiva client
router.delete('/:id', async (req, res) => {
  const result = await deleteClient(
    req.params.id,
    req.user,
    req.supabase
  )

  if (!result.success) {
    const errors = result.errors || []

    if (errors.includes('Autentificare necesara')) {
      return res.status(401).json(result)
    }

    if (errors.includes('Clientul nu a fost gasit')) {
      return res.status(404).json(result)
    }

    return res.status(500).json(result)
  }

  return res.status(200).json(result)
})


export default router
