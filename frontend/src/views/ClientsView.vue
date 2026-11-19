<script setup>
import {
  useClients
} from '../composables/useClients.js'

const {
  clients,
  loading,
  saving,
  deletingId,
  errors,
  successMessage,
  form,
  submitClient,
  removeClient
} = useClients()
</script>



<template>
  <main class="clients-page">
    <div class="clients-container">
      <div class="clients-header">
        <div>
          <h1>Gestionare clienti</h1>
          <p>
            Adauga si vizualizeaza clientii companiei tale.
          </p>
        </div>

        <RouterLink
          to="/dashboard"
          class="back-link"
        >
          Inapoi la Dashboard
        </RouterLink>
      </div>

      <section class="clients-card">
        <h2>Adauga client nou</h2>

        <form @submit.prevent="submitClient">
          <div class="form-grid">
            <label>
              Denumire client
              <input
                v-model="form.name"
                type="text"
                placeholder="SC Exemplu SRL"
                required
              />
            </label>

            <label>
              CUI
              <input
                v-model="form.cui"
                type="text"
                placeholder="RO12345678"
                required
              />
            </label>

            <label>
              Adresa
              <input
                v-model="form.address"
                type="text"
                placeholder="Bucuresti, Str. Exemplu nr. 10"
                required
              />
            </label>

            <label>
              Email
              <input
                v-model="form.email"
                type="email"
                placeholder="contact@exemplu.ro"
                required
              />
            </label>
          </div>

          <div
            v-if="errors.length"
            class="clients-error"
            role="alert"
          >
            <p
              v-for="error in errors"
              :key="error"
            >
              {{ error }}
            </p>
          </div>

          <p
            v-if="successMessage"
            class="clients-success"
            role="status"
          >
            {{ successMessage }}
          </p>

          <button
            type="submit"
            class="clients-button"
            :disabled="saving"
          >
            {{ saving ? 'Se salveaza...' : 'Adauga client' }}
          </button>
        </form>
      </section>

      <section class="clients-card">
        <h2>Lista clientilor</h2>

        <p v-if="loading">
          Se incarca clientii...
        </p>

        <p v-else-if="clients.length === 0">
          Nu exista clienti inregistrati.
        </p>

        <div
          v-else
          class="clients-table-wrapper"
        >
          <table class="clients-table">
            <thead>
              <tr>
                <th>Denumire</th>
                <th>CUI</th>
                <th>Adresa</th>
                <th>Email</th>
                <th>Actiuni</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="client in clients"
                :key="client.id"
              >
                <td>{{ client.name }}</td>
                <td>{{ client.cui }}</td>
                <td>{{ client.address }}</td>
                <td>{{ client.email }}</td>

                <td>
                  <button
                    type="button"
                    class="delete-client-button"
                    :disabled="deletingId !== null"
                    @click="removeClient(client)"
                  >
                    {{
                      deletingId === client.id
                        ? 'Se sterge...'
                        : 'Sterge'
                    }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</template>
