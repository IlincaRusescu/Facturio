import { Router } from 'express'
import { createSupabaseClient } from '../config/supabase.js'
import { registerUser } from '../services/auth.service.js'

const router = Router()

// GET /api/auth/companies
// Returneaza companiile disponibile la inregistrare
router.get('/companies', async (req, res) => {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.rpc(
      'registration_companies'
    )

    if (error) {
      console.error('Eroare companii:', error.message)

      return res.status(500).json({
        success: false,
        message: 'Nu s-au putut incarca companiile'
      })
    }

    return res.status(200).json({
      success: true,
      companies: data ?? []
    })
  } catch (error) {
    console.error('Eroare server:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Eroare la incarcarea companiilor'
    })
  }
})

// POST /api/auth/register
// Creeaza contul si profilul utilizatorului
router.post('/register', async (req, res) => {
  try {
    const supabase = createSupabaseClient()

    const result = await registerUser(
      req.body ?? {},
      supabase
    )

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.errors
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Contul a fost creat cu succes',
      user: {
        id: result.user.id
      }
    })
  } catch (error) {
    console.error('Eroare inregistrare:', error.message)

    return res.status(500).json({
      success: false,
      errors: ['A aparut o eroare la inregistrare']
    })
  }
})

export default router
