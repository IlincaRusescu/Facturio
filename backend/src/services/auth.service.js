import { validateRegistration } from '../validators/registration.validator.js'

export async function registerUser(data, supabase) {
  // 1. Validarea datelor
  const validation = validateRegistration(data)

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    }
  }

  try {
    // 2. Crearea contului in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password
      })

    if (authError) {
      return {
        success: false,
        errors: [authError.message]
      }
    }

    // 3. Verificarea sesiunii
    if (!authData?.user || !authData?.session) {
      return {
        success: false,
        errors: ['Nu s-a putut crea o sesiune pentru utilizator']
      }
    }

    // 4. Asocierea contului cu compania selectata
    const { error: profileError } = await supabase.rpc(
      'register_profile',
      {
        p_first_name: data.firstName.trim(),
        p_last_name: data.lastName.trim(),
        p_company_id: data.companyId.trim()
      }
    )

    if (profileError) {
      return {
        success: false,
        errors: [profileError.message]
      }
    }

    // 5. Inregistrare reusita
    return {
      success: true,
      user: authData.user,
      errors: []
    }

  } catch (error) {
    return {
      success: false,
      errors: [
        error?.message || 'Eroare la inregistrare'
      ]
    }
  }
}