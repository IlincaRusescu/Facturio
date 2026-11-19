import { ref, onMounted } from 'vue'

import {
  fetchClients,
  addClient,
  deleteClient
} from '../services/clients.service.js'

// Gestioneaza datele si operatiile pentru clienti
export function useClients() {
  const clients = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const deletingId = ref(null)

  const errors = ref([])
  const successMessage = ref('')

  const form = ref({
    name: '',
    cui: '',
    address: '',
    email: ''
  })

  // Incarca lista clientilor companiei autentificate
  async function loadClients() {
    loading.value = true

    try {
      const result = await fetchClients()
      clients.value = result.clients
    } catch (error) {
      errors.value = [error.message]
    } finally {
      loading.value = false
    }
  }

  // Salveaza clientul si actualizeaza lista
  async function submitClient() {
    errors.value = []
    successMessage.value = ''
    saving.value = true

    try {
      await addClient(form.value)

      successMessage.value =
        'Clientul a fost adaugat cu succes!'

      form.value = {
        name: '',
        cui: '',
        address: '',
        email: ''
      }

      await loadClients()
    } catch (error) {
      errors.value = [error.message]
    } finally {
      saving.value = false
    }
  }


  // Sterge clientul dupa confirmarea utilizatorului
  async function removeClient(client) {
    const confirmed = window.confirm(
      `Esti sigur ca vrei sa stergi clientul "${client.name}"?\n\n` +
      'ATENTIE: Vor fi sterse definitiv si toate facturile ' +
      'si pozitiile facturilor asociate acestui client.\n\n' +
      'Aceasta operatiune nu poate fi anulata.'
    )

    if (!confirmed) {
      return
    }

    errors.value = []
    successMessage.value = ''
    deletingId.value = client.id

    try {
      await deleteClient(client.id)

      await loadClients()

      if (errors.value.length === 0) {
        successMessage.value =
          'Clientul a fost sters definitiv cu succes!'
      }
    } catch (error) {
      errors.value = [error.message]
    } finally {
      deletingId.value = null
    }
  }


  onMounted(loadClients)

  return {
    clients,
    loading,
    saving,
    deletingId,
    errors,
    successMessage,
    form,
    loadClients,
    submitClient,
    removeClient
  }
}
