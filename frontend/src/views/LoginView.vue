<script setup>
import facturioLogo from '../assets/facturio-logo.png'
import { useLogin } from '../composables/useLogin.js'

const {
  form,
  loading,
  showPassword,
  errorMessage,
  handleSubmit
} = useLogin()
</script>


<template>
  <div class="login-page">
    <main class="login-content">
      <header class="login-branding">
        <img
          :src="facturioLogo"
          alt="Logo FACTURIO"
          class="login-logo"
        />
        <span>FACTURIO</span>
      </header>

      <section class="login-card">
        <h1>Bine ai revenit!</h1>
        <p class="login-subtitle">
          Autentifica-te pentru a accesa contul companiei tale.
        </p>

        <form @submit.prevent="handleSubmit" novalidate>
          <div class="login-field">
            <label for="login-email">Adresa de e-mail *</label>
            <input
              id="login-email"
              v-model="form.email"
              type="email"
              placeholder="exemplu@email.com"
              autocomplete="email"
            />
          </div>

          <div class="login-field">
            <label for="login-password">Parola *</label>

            <div class="password-wrapper">
              <input
                id="login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Introdu parola"
                autocomplete="current-password"
              />

              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Ascunde' : 'Arata' }}
              </button>
            </div>
          </div>

          <p
            v-if="errorMessage"
            class="login-error"
            role="alert"
          >
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            class="login-submit"
            :disabled="loading"
          >
            {{ loading ? 'Se autentifica...' : 'Autentifica-te' }}
          </button>
        </form>

        <p class="register-link">
          Nu ai un cont?
          <RouterLink to="/register">
            Creeaza-ti cont
          </RouterLink>
        </p>

        <footer class="login-footer">
          FACTURIO · Facturare simpla, fara complicatii
        </footer>
      </section>
    </main>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 24px 16px 48px;
  background: #f5f0ff;
  color: #171b3b;
}

.login-content {
  max-width: 540px;
  margin: 0 auto;
}

.login-branding {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  color: #6341c0;
  font-size: 29px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.login-logo {
  width: 62px;
  height: 62px;
  object-fit: contain;
}

.login-card {
  padding: 40px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 18px 45px rgba(85, 56, 145, 0.08);
}

h1 {
  margin: 0;
  text-align: center;
  font-size: 27px;
}

.login-subtitle {
  margin: 12px 0 30px;
  text-align: center;
  line-height: 1.6;
  font-size: 13px;
  color: #8282a4;
}

.login-field {
  margin-bottom: 22px;
}

.login-field label {
  display: block;
  margin-bottom: 9px;
  font-weight: 600;
  font-size: 13px;
}

.login-field input {
  box-sizing: border-box;
  width: 100%;
  height: 47px;
  padding: 0 13px;
  border: 1px solid #ded5ef;
  border-radius: 12px;
  background: white;
  color: #171b3b;
  font: inherit;
  outline: none;
}

.login-field input:focus {
  border-color: #8965db;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 85px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: none;
  color: #8965db;
  cursor: pointer;
  font-weight: 600;
}

.login-error {
  padding: 12px;
  border-radius: 10px;
  background: #fff0f0;
  color: #a32540;
  font-size: 13px;
  white-space: pre-line;
}

.login-submit {
  width: 100%;
  height: 47px;
  margin-top: 6px;
  border: none;
  border-radius: 12px;
  background: #8965db;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.login-submit:hover:not(:disabled) {
  background: #7550c9;
}

.login-submit:disabled {
  opacity: 0.65;
  cursor: wait;
}

.register-link {
  margin: 25px 0;
  text-align: center;
  color: #8282a4;
  font-size: 13px;
}

.register-link a {
  color: #8965db;
  font-weight: 700;
  text-decoration: none;
}

.login-footer {
  padding-top: 20px;
  border-top: 1px solid #eee7f8;
  text-align: center;
  color: #aaa1c3;
  font-size: 11px;
}

@media (max-width: 600px) {
  .login-card {
    padding: 28px 22px;
  }

  .login-branding {
    font-size: 24px;
  }
}
</style>
