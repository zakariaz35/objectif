import { createApp } from 'vue'
import './style.css'
import './lib/theme' // apply the saved theme before the first render
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
