import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api'

// Persistent client token (anonymous identity for progress tracking, before real auth).
function clientToken() {
  let t = localStorage.getItem('client_token')
  if (!t) {
    t = 'c_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('client_token', t)
  }
  return t
}

const api = axios.create({ baseURL })
api.interceptors.request.use((config) => {
  config.headers['X-Client-Token'] = clientToken()
  // Bearer token if the user is logged in (read directly from localStorage).
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  getDoc: (name) => api.get(`/docs/${name}`).then((r) => r.data.html),
  // ⚠️ DEBUG / personal use only — remove if the project is no longer personal.
  listUsers: () => api.get('/users').then((r) => r.data.data),
  listFormations: () => api.get('/formations').then((r) => r.data.data),
  getFormation: (slug) => api.get(`/formations/${slug}`).then((r) => r.data),
  listParcours: () => api.get('/parcours').then((r) => r.data.data),
  getParcours: (slug) => api.get(`/parcours/${slug}`).then((r) => r.data),
  importFormation: (slug) => api.post(`/formations/${slug}/import`).then((r) => r.data),
  listContentFormations: () => api.get('/content/formations').then((r) => r.data.data),
  getLesson: (slug, module, lesson) =>
    api.get(`/formations/${slug}/lessons/${module}/${lesson}`).then((r) => r.data),
  gradeQuiz: (slug, module, lesson, answers) =>
    api
      .post(`/formations/${slug}/lessons/${module}/${lesson}/grade`, { answers })
      .then((r) => r.data),
  getProgress: (slug) => api.get(`/formations/${slug}/progress`).then((r) => r.data),
  toggleProgress: (slug, module, lesson, completed) =>
    api
      .post(`/formations/${slug}/progress/${module}/${lesson}`, { completed })
      .then((r) => r.data),
  importZip: (file, onProgress) => {
    const form = new FormData()
    form.append('archive', file)
    return api
      .post('/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress,
      })
      .then((r) => r.data)
  },
}
