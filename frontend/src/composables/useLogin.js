
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { loginUser } from '../services/auth.service.js'
import { saveSession } from '../services/session.service.js'

export function useLogin() {
  const router = useRouter()

  const form = reactive({
    email: '',
    password: ''
  })

  const loading = ref(false)
  const showPassword = ref(false)
  const errorMessage = ref('')

  function validateForm() {
    errorMessage.value = ''

    if (!form.email.trim() || !form.password) {
      errorMessage.value = 'Completeaza emailul si parola.'
      return false
    }

    return true
  }

  async function handleSubmit() {
    if (loading.value) return
    if (!validateForm()) return

    loading.value = true

    try {
      const credentials = {
        email: form.email.trim().toLowerCase(),
        password: form.password
      }

      const result = await loginUser(credentials)

      saveSession(result.session)

      await router.push('/dashboard')
    } catch (error) {
      errorMessage.value =
        error.message || 'Autentificarea a esuat.'
    } finally {
      loading.value = false
    }
  }

  return {
    form,
    loading,
    showPassword,
    errorMessage,
    handleSubmit
  }
}
