export async function loginUser(credentials, supabase) {
  const email = credentials?.email?.trim().toLowerCase()
  const password = credentials?.password

  if (!email || !password) {
    return {
      success: false,
      errors: ['Emailul si parola sunt obligatorii']
    }
  }

  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      })

    if (error) {
      return {
        success: false,
        errors: [error.message]
      }
    }

    if (!data?.user || !data?.session?.access_token) {
      return {
        success: false,
        errors: ['Nu s-a putut crea sesiunea utilizatorului']
      }
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      errors: []
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        error?.message || 'Eroare la autentificare'
      ]
    }
  }
}
