<script setup>
import { reactive, ref, onMounted } from 'vue'
import facturioLogo from '../assets/facturio-logo.png'

import {
  getRegistrationCompanies,
  registerUser
} from '../services/auth.service.js'

// Datele formularului
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  companyId: ''
})

// Starea interfetei
const companies = ref([])
const loadingCompanies = ref(false)
const loading = ref(false)
const showPassword = ref(false)

// Mesaje si erori
const errors = reactive({})
const errorMessage = ref('')
const successMessage = ref('')

// Stergerea erorilor anterioare
function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])

  errorMessage.value = ''
  successMessage.value = ''
}

// Validarea formularului
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

// Incarcarea companiilor din Supabase
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

// Inregistrarea utilizatorului
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
      successMessage.value =
        'Contul a fost creat cu succes!'

      // Golim formularul dupa inregistrare
      form.firstName = ''
      form.lastName = ''
      form.email = ''
      form.password = ''
      form.companyId = ''
    }
  } catch (error) {
    errorMessage.value =
      error.message ||
      'A aparut o eroare la crearea contului.'
  } finally {
    loading.value = false
  }
}

// Incarcam lista companiilor la deschiderea paginii
onMounted(loadCompanies)
</script>


<template>
  <div class="register-page">
    <main class="register-content">

      <!-- Branding aliniat la stanga cardului -->
      <header class="page-branding">
        <img
          :src="facturioLogo"
          alt="Mascota FACTURIO"
          class="brand-logo"
        />
        <span class="brand-name">FACTURIO</span>
      </header>

      <!-- Card de inregistrare -->
      <section class="register-card">
        <div class="heading">
          <h1>Creeaza-ti contul</h1>
          <p>
            Incepe sa gestionezi clientii si facturile
            companiei tale, simplu si organizat.
          </p>
        </div>

        <form
          class="register-form"
          @submit.prevent="handleSubmit"
          novalidate
        >
          <!-- Prenume si nume -->
          <div class="name-row">
            <div class="form-field">
              <label for="firstName">
                Prenume <span class="required">*</span>
              </label>

              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                autocomplete="given-name"
                placeholder="Ex: Ana"
                :class="{ invalid: errors.firstName }"
                :aria-invalid="Boolean(errors.firstName)"
                :aria-describedby="
                  errors.firstName ? 'firstName-error' : undefined
                "
                @input="delete errors.firstName"
              />

              <small
                v-if="errors.firstName"
                id="firstName-error"
                class="field-error"
              >
                {{ errors.firstName }}
              </small>
            </div>

            <div class="form-field">
              <label for="lastName">
                Nume <span class="required">*</span>
              </label>

              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                autocomplete="family-name"
                placeholder="Ex: Popescu"
                :class="{ invalid: errors.lastName }"
                :aria-invalid="Boolean(errors.lastName)"
                :aria-describedby="
                  errors.lastName ? 'lastName-error' : undefined
                "
                @input="delete errors.lastName"
              />

              <small
                v-if="errors.lastName"
                id="lastName-error"
                class="field-error"
              >
                {{ errors.lastName }}
              </small>
            </div>
          </div>

          <!-- E-mail -->
          <div class="form-field">
            <label for="email">
              Adresa de e-mail <span class="required">*</span>
            </label>

            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="exemplu@email.com"
              :class="{ invalid: errors.email }"
              :aria-invalid="Boolean(errors.email)"
              :aria-describedby="
                errors.email ? 'email-error' : undefined
              "
              @input="delete errors.email"
            />

            <small
              v-if="errors.email"
              id="email-error"
              class="field-error"
            >
              {{ errors.email }}
            </small>
          </div>

          <!-- Parola -->
          <div class="form-field">
            <label for="password">
              Parola <span class="required">*</span>
            </label>

            <div class="password-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Minimum 8 caractere"
                :class="{ invalid: errors.password }"
                :aria-invalid="Boolean(errors.password)"
                :aria-describedby="
                  errors.password ? 'password-error' : 'password-hint'
                "
                @input="delete errors.password"
              />

              <button
                type="button"
                class="password-toggle"
                :aria-label="
                  showPassword ? 'Ascunde parola' : 'Afiseaza parola'
                "
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Ascunde' : 'Arata' }}
              </button>
            </div>

            <small
              v-if="errors.password"
              id="password-error"
              class="field-error"
            >
              {{ errors.password }}
            </small>

            <small
              v-else
              id="password-hint"
              class="field-hint"
            >
              Foloseste cel putin 8 caractere.
            </small>
          </div>

          <!-- Selectare companie -->
          <div class="form-field">
            <label for="companyId">
              Companie <span class="required">*</span>
            </label>

            <select
              id="companyId"
              v-model="form.companyId"
              :disabled="loadingCompanies"
              :class="{ invalid: errors.companyId }"
              :aria-invalid="Boolean(errors.companyId)"
              :aria-describedby="
                errors.companyId ? 'companyId-error' : 'company-hint'
              "
              @change="delete errors.companyId"
            >
              <option value="" disabled>
                {{
                  loadingCompanies
                    ? 'Se incarca...'
                    : 'Selecteaza compania'
                }}
              </option>

              <option
                v-for="company in companies"
                :key="company.id"
                :value="company.id"
              >
                {{ company.name }}
              </option>
            </select>

            <small
              v-if="errors.companyId"
              id="companyId-error"
              class="field-error"
            >
              {{ errors.companyId }}
            </small>

            <small
              v-else
              id="company-hint"
              class="field-hint"
            >
              Selecteaza compania din care faci parte.
            </small>
          </div>

          <!-- Mesaje de eroare si succes -->
          <div
            v-if="errorMessage"
            class="alert alert-error"
            role="alert"
          >
            {{ errorMessage }}
          </div>

          <div
            v-if="successMessage"
            class="alert alert-success"
            role="status"
          >
            {{ successMessage }}
          </div>

          <!-- Buton de inregistrare -->
          <button
            type="submit"
            class="btn-primary submit-button"
            :disabled="loading || loadingCompanies"
          >
            <span
              v-if="loading"
              class="spinner"
            ></span>

            <span>
              {{
                loading
                  ? 'Se creeaza contul...'
                  : 'Creeaza cont'
              }}
            </span>

            <span v-if="!loading" aria-hidden="true">
              →
            </span>
          </button>
        </form>

        <!-- Autentificare -->
        <p class="login-prompt">
          Ai deja un cont?
          <a href="/login">Autentifica-te</a>
        </p>

        <!-- Footer -->
        <p class="form-footer">
          FACTURIO · Facturare simpla, fara complicatii
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Fundalul paginii */

.register-page {
  min-height: 100vh;
  min-height: 100dvh;

  display: flex;
  justify-content: center;
  align-items: flex-start;

  padding: 32px 20px 48px;

  background:
    radial-gradient(
      circle at 0% 95%,
      rgba(174, 140, 235, 0.18),
      transparent 34%
    ),
    radial-gradient(
      circle at 100% 35%,
      rgba(174, 140, 235, 0.15),
      transparent 36%
    ),
    linear-gradient(
      145deg,
      var(--bg-soft),
      var(--bg)
    );
}

/* Container central */

.register-content {
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
}

/* Logo si FACTURIO */

.page-branding {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;

  width: 100%;
  margin-bottom: 18px;
  padding-left: 4px;
}

.brand-logo {
  display: block;
  width: 62px;
  height: 62px;
  object-fit: contain;
  flex-shrink: 0;
}

.brand-name {
  color: var(--primary-dark);
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 1px;
  line-height: 1.2;
}

/* Card */

.register-card {
  width: 100%;
  padding: 36px 40px 24px;

  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);

  box-shadow: var(--shadow-card);
}

/* Titlu */

.heading {
  margin-bottom: 28px;
  text-align: center;
}

.heading h1 {
  margin-bottom: 10px;
  font-size: 27px;
  letter-spacing: -0.6px;
}

.heading p {
  max-width: 390px;
  margin: 0 auto;

  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.7;
}

/* Formular */

.register-form {
  display: flex;
  flex-direction: column;
  gap: 19px;
}

.name-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}

.required {
  color: var(--primary);
}

/* Parola */

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 90px;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);

  padding: 7px;
  border: none;
  background: transparent;

  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.password-toggle:hover {
  color: var(--primary-dark);
}

/* Buton */

.submit-button {
  width: 100%;
  margin-top: 4px;
}

/* Autentificare */

.login-prompt {
  margin-top: 24px;
  text-align: center;

  color: var(--text-secondary);
  font-size: 12px;
}

.login-prompt a {
  margin-left: 4px;
  font-weight: 700;
}

/* Footer */

.form-footer {
  margin-top: 25px;
  padding-top: 18px;

  border-top: 1px solid var(--border-light);

  color: var(--text-muted);
  text-align: center;
  font-size: 11px;
}

/* Responsive */

@media (max-width: 480px) {
  .register-page {
    padding: 20px 12px 25px;
  }

  .register-card {
    padding: 27px 21px 22px;
    border-radius: 17px;
  }

  .brand-logo {
    width: 52px;
    height: 52px;
  }

  .brand-name {
    font-size: 25px;
  }

  .heading h1 {
    font-size: 23px;
  }

  .heading p {
    font-size: 12px;
  }

  .name-row {
    grid-template-columns: 1fr;
  }

  .register-form {
    gap: 17px;
  }
}
</style>
