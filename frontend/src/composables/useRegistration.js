import { reactive, ref, onMounted } from 'vue'

import {
  getRegistrationCompanies,
  registerUser
} from '../services/auth.service.js'

export function useRegistration() {
  const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyId: ''
  })

  const companies = ref([])
  const loadingCompanies = ref(false)
  const loading = ref(false)
  const showPassword = ref(false)

  const errors = reactive({})
  const errorMessage = ref('')
  const successMessage = ref('')

  function clearErrors() {
    Object.keys(errors).forEach(key => delete errors[key])
    errorMessage.value = ''
    successMessage.value = ''
  }

  function validateForm() {
    clearErrors()

    if (!form.firstName.trim()) {
      errors.firstName = 'Introdu prenumele.'
    }

    if (!form.lastName.trim()) {
      errors.lastName = 'Introdu numele.'
    }

    const email = form.email.trim()

    if (!email) {
      errors.email = 'Introdu adresa de e-mail.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Introdu o adresa de e-mail valida.'
    }

    if (!form.password) {
      errors.password = 'Introdu o parola.'
    } else if (form.password.length < 8) {
      errors.password =
        'Parola trebuie sa aiba minimum 8 caractere.'
    }

    if (!form.companyId) {
      errors.companyId = 'Selecteaza o companie.'
    }

    return Object.keys(errors).length === 0
  }

  async function loadCompanies() {
    loadingCompanies.value = true

    try {
      companies.value = await getRegistrationCompanies()
    } catch (error) {
      errorMessage.value =
        error.message || 'Eroare la incarcarea companiilor.'
    } finally {
      loadingCompanies.value = false
    }
  }

  async function handleSubmit() {
    if (loading.value) return
    if (!validateForm()) return

    loading.value = true

    try {
      const result = await registerUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        companyId: form.companyId
      })

      if (result.success) {
        successMessage.value = 'Contul a fost creat cu succes!'

        form.firstName = ''
        form.lastName = ''
        form.email = ''
        form.password = ''
        form.companyId = ''
      }
    } catch (error) {
      errorMessage.value =
        error.message || 'A aparut o eroare la crearea contului.'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadCompanies)

  return {
    form,
    companies,
    loadingCompanies,
    loading,
    showPassword,
    errors,
    errorMessage,
    successMessage,
    handleSubmit
  }
}
