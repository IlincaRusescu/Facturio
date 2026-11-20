
import {
  createRouter,
  createWebHistory
} from 'vue-router'

import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ClientsView from '../views/ClientsView.vue'

import {
  getAccessToken,
  clearSession
} from '../services/session.service.js'

import {
  getCurrentUser
} from '../services/auth.service.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/register',
      component: RegisterView
    },
    {
      path: '/login',
      component: LoginView
    },
    {
      path: '/dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/clients',
      component: ClientsView,
      meta: { requiresAuth: true }
    }
  ]
})

// Blocheaza navigarea catre pagini protejate
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) {
    return true
  }

  if (!getAccessToken()) {
    return '/login'
  }

  try {
    await getCurrentUser()
    return true
  } catch {
    clearSession()
    return '/login'
  }
})

export default router
