import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api'

// Token client persistant (identité anonyme pour la progression, avant la vraie auth).
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
  return config
})

export default {
  listFormations: () => api.get('/formations').then((r) => r.data.data),
  getFormation: (slug) => api.get(`/formations/${slug}`).then((r) => r.data),
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
