import { reactive, computed } from 'vue'
import api from './api'

// Shared authentication state (token persisted in localStorage).
const state = reactive({
  token: localStorage.getItem('auth_token') || null,
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
})

function persist() {
  if (state.token) {
    localStorage.setItem('auth_token', state.token)
    localStorage.setItem('auth_user', JSON.stringify(state.user))
  } else {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }
}

export const auth = {
  state,
  isAuthenticated: computed(() => !!state.token),
  token: () => state.token,

  async register(payload) {
    const { token, user } = await api.register(payload)
    state.token = token
    state.user = user
    persist()
  },

  async login(payload) {
    const { token, user } = await api.login(payload)
    state.token = token
    state.user = user
    persist()
  },

  async logout() {
    try {
      await api.logout()
    } catch (e) {
      /* token already invalid: clean up anyway */
    }
    state.token = null
    state.user = null
    persist()
  },
}
