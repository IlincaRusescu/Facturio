<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { getCurrentUser } from '../services/auth.service.js'
import { clearSession } from '../services/session.service.js'

const router = useRouter()

const user = ref(null)
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const result = await getCurrentUser()
    user.value = result.user
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
})

function handleLogout() {
  clearSession()
  user.value = null
  router.replace('/login')
}
</script>




<template>
  <main class="dashboard-page">
    <section class="dashboard-card">
      <h1>FACTURIO</h1>

      <p v-if="loading">Se incarca profilul...</p>

      <p v-else-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

      <template v-else-if="user">
        <h2>Bine ai venit, {{ user.firstName }}!</h2>

        <p>Autentificarea a fost realizata cu succes.</p>

        <div class="user-details">
          <p>
            <strong>Utilizator:</strong>
            {{ user.firstName }} {{ user.lastName }}
          </p>

          <p>
            <strong>Email:</strong>
            {{ user.email }}
          </p>

          <p>
            <strong>ID companie:</strong>
            {{ user.companyId }}
          </p>
        </div>

        <p class="note">
          Gestionarea clientilor si a facturilor
          va fi disponibila in sprinturile urmatoare.
        </p>

        <button
          type="button"
          class="logout-button"
          @click="handleLogout"
        >
          Deconectare
        </button>
      </template>
    </section>
  </main>
</template>


<style scoped>
.dashboard-page {
  min-height: 100vh;
  padding: 48px 16px;
  background: #f5f0ff;
  color: #171b3b;
}

.dashboard-card {
  max-width: 650px;
  margin: 0 auto;
  padding: 36px;
  border-radius: 22px;
  background: white;
  box-shadow: 0 18px 45px rgba(85, 56, 145, 0.08);
}

h1 {
  color: #6341c0;
  margin-top: 0;
}

h2 {
  margin-top: 26px;
}

.user-details {
  margin: 24px 0;
  padding: 18px;
  border-radius: 12px;
  background: #f5f0ff;
  overflow-wrap: anywhere;
}

.note {
  font-size: 13px;
  color: #8282a4;
}

.error {
  color: #a32540;
}

.logout-button {
  margin-top: 16px;
  padding: 12px 24px;
  background: #8965db;
  color: white;
  border: none;
  border-radius: 10px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.logout-button:hover {
  background: #7550c9;
}

.logout-button:focus-visible {
  outline: 3px solid #c5aff3;
  outline-offset: 3px;
}

</style>
