
import { ref, onMounted } from 'vue'

import {
  fetchClients,
  addClient,
  deleteClient,
  updateClient
} from '../services/clients.service.js'

// Gestioneaza operatiile de adaugare, editare si stergere clienti
export function useClients() {
  const clients = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const deletingId = ref(null)

  const editingId = ref(null)

  const errors = ref([])
  const successMessage = ref('')

  function emptyForm() {
    return {
      name: '',
      cui: '',
      address: '',
      email: ''
    }
  }

  const form = ref(emptyForm())

  // Reseteaza formularul si iese din modul de editare
  function resetClientForm() {
    editingId.value = null
    form.value = emptyForm()
  }

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

  // Pregateste formularul pentru editarea unui client
  function startEdit(client) {
    editingId.value = client.id

    form.value = {
      name: client.name,
      cui: client.cui,
      address: client.address,
      email: client.email
    }

    errors.value = []
    successMessage.value = ''

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Renunta la editare si reseteaza formularul
  function cancelEdit() {
    resetClientForm()

    errors.value = []
    successMessage.value = ''
  }

  // Salveaza un client nou sau actualizeaza unul existent
  async function submitClient() {
    errors.value = []
    successMessage.value = ''
    saving.value = true

    try {
      if (editingId.value) {
        await updateClient(editingId.value, form.value)

        successMessage.value =
          'Clientul a fost actualizat cu succes!'
      } else {
        await addClient(form.value)

        successMessage.value =
          'Clientul a fost adaugat cu succes!'
      }

      resetClientForm()

      await loadClients()
    } catch (error) {
      errors.value = [error.message]
    } finally {
      saving.value = false
    }
  }

  // Sterge definitiv clientul dupa confirmare
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

      if (editingId.value === client.id) {
        resetClientForm()
      }

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
    editingId,
    errors,
    successMessage,
    form,
    loadClients,
    submitClient,
    startEdit,
    cancelEdit,
    removeClient
  }
}
