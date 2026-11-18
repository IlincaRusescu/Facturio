import {
  createSupabaseClient
} from '../config/supabase.js'

// Verifica tokenul si identifica firma utilizatorului
export function createRequireAuth(supabase) {
  return async (req, res, next) => {
    const authorization = req.headers.authorization || ''

    const match = authorization.match(
      /^Bearer\s+(.+)$/i
    )

    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Autentificare necesara'
      })
    }

    const token = match[1].trim()

    try {
      // Verificarea tokenului la Supabase Auth
      const { data, error } =
        await supabase.auth.getUser(token)

      if (error || !data?.user) {
        return res.status(401).json({
          success: false,
          message: 'Sesiune invalida sau expirata'
        })
      }

      // Citim profilul in contextul utilizatorului
      const userSupabase = createSupabaseClient(token)

      const { data: profile, error: profileError } =
        await userSupabase
          .from('profiles')
          .select('id, first_name, last_name, company_id')
          .eq('id', data.user.id)
          .single()

      if (profileError || !profile?.company_id) {
        return res.status(403).json({
          success: false,
          message: 'Profilul companiei nu este disponibil'
        })
      }

      req.user = {
        id: data.user.id,
        email: data.user.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        companyId: profile.company_id
      }

      req.supabase = userSupabase

      next()
    } catch (error) {
      console.error('Verificare sesiune:', error.message)

      return res.status(401).json({
        success: false,
        message: 'Nu s-a putut valida sesiunea'
      })
    }
  }
}

// Permite accesul doar la firma utilizatorului
export function requireCompanyAccess(req, res, next) {
  const requestedCompanyId = req.params.companyId
  const userCompanyId = req.user?.companyId

  if (
    !requestedCompanyId ||
    !userCompanyId ||
    requestedCompanyId !== userCompanyId
  ) {
    return res.status(403).json({
      success: false,
      message: 'Nu ai acces la datele acestei companii'
    })
  }

  next()
}
