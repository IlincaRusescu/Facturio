<script setup>
import {
  useClients
} from '../composables/useClients.js'

const {
  clients,
  loading,
  saving,
  deletingId,
  editingId,
  errors,
  successMessage,
  form,
  submitClient,
  startEdit,
  cancelEdit,
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
        <h2>
          {{ editingId ? 'Editeaza client' : 'Adauga client nou' }}
        </h2>

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

          <div class="form-actions">
            <button
              type="submit"
              class="clients-button"
              :disabled="saving"
            >
              {{
                saving
                  ? 'Se salveaza...'
                  : editingId
                    ? 'Salveaza modificarile'
                    : 'Adauga client'
              }}
            </button>

            <button
              v-if="editingId"
              type="button"
              class="cancel-edit-button"
              :disabled="saving"
              @click="cancelEdit"
            >
              Anuleaza editarea
            </button>
          </div>

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
                  <div class="client-row-actions">
                    <button
                      type="button"
                      class="edit-client-button"
                      :disabled="saving || deletingId !== null"
                      @click="startEdit(client)"
                    >
                      Editeaza
                    </button>

                    <button
                      type="button"
                      class="delete-client-button"
                      :disabled="saving || deletingId !== null"
                      @click="removeClient(client)"
                    >
                      {{
                        deletingId === client.id
                          ? 'Se sterge...'
                          : 'Sterge'
                      }}
                    </button>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</template>


<style scoped>
/* FACTURIO - Gestionarea clientilor */

.clients-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: #f7f4ff;
  color: #30244d;
}

.clients-container {
  max-width: 1100px;
  margin: 0 auto;
}

/* Header */

.clients-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
}

.clients-header h1 {
  margin: 0 0 8px;
  color: #55318a;
  font-size: 28px;
  font-weight: 750;
}

.clients-header p {
  color: #77698d;
  font-size: 14px;
}

.back-link {
  color: #6840a3;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.back-link:hover {
  color: #51339e;
  text-decoration: underline;
}

/* Carduri */

.clients-card {
  background: #ffffff;
  padding: 28px;
  margin-bottom: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(65, 40, 110, 0.08);
}

.clients-card h2 {
  margin: 0 0 22px;
  color: #55318a;
  font-size: 21px;
  font-weight: 700;
}

/* Formular */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #30244d;
  font-size: 14px;
  font-weight: 600;
}

.form-grid input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 12px;
  border: 1px solid #d6cbe9;
  border-radius: 8px;
  background: #ffffff;
  color: #30244d;
  font: inherit;
  font-weight: 400;
}

.form-grid input:focus {
  outline: 2px solid #ae8ce1;
  outline-offset: 1px;
}

.form-grid input::placeholder {
  color: #aaa1bd;
}

/* Actiuni formular */

.form-actions {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 12px;
  margin-top: 22px;
}

.clients-button,
.cancel-edit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  margin: 0;
  padding: 0 22px;
  border-radius: 9px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.clients-button {
  border: none;
  background: #7651b2;
  color: white;
  transition: background 0.2s ease;
}

.clients-button:hover:not(:disabled) {
  background: #63419c;
}

.cancel-edit-button {
  border: 1px solid #d6cbe9;
  background: white;
  color: #6840a3;
}

.cancel-edit-button:hover:not(:disabled) {
  background: #f7f4ff;
}

/* Mesaje */

.clients-error {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fff1f3;
  color: #b42342;
  font-size: 13px;
}

.clients-error p {
  margin: 0;
}

.clients-success {
  margin-top: 16px;
  color: #17803d;
  font-size: 14px;
  font-weight: 500;
}

/* Lista clientilor */

.clients-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.clients-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.clients-table th,
.clients-table td {
  padding: 14px 12px;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid #eee7f6;
}

.clients-table th {
  background: #f7f4ff;
  color: #55318a;
  font-weight: 700;
  white-space: nowrap;
}

.clients-table td {
  color: #30244d;
}

.clients-table tbody tr:hover {
  background: #fcfaff;
}

/* Butoane editare si stergere */

.client-row-actions {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
}

.edit-client-button,
.delete-client-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 9px 13px;
  border-radius: 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease;
}

.edit-client-button {
  border: 1px solid #d4c2f0;
  background: #f2eaff;
  color: #6341c0;
}

.edit-client-button:hover:not(:disabled) {
  background: #e7d8ff;
}

.delete-client-button {
  border: 1px solid #e4b6c1;
  background: #fff1f3;
  color: #b42342;
}

.delete-client-button:hover:not(:disabled) {
  background: #ffe0e6;
}

.edit-client-button:disabled,
.delete-client-button:disabled,
.cancel-edit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-client-button:focus-visible,
.delete-client-button:focus-visible,
.cancel-edit-button:focus-visible {
  outline: 3px solid #c5aff3;
  outline-offset: 2px;
}

/* Responsive */

@media (max-width: 650px) {
  .clients-page {
    padding: 24px 14px;
  }

  .clients-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .clients-header h1 {
    font-size: 24px;
  }

  .clients-card {
    padding: 20px 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .clients-table {
    min-width: 700px;
  }
}
</style>
