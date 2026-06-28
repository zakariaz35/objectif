import { createApp } from 'vue'
import './style.css'
import './lib/theme' // applique le thème enregistré avant le premier rendu
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
