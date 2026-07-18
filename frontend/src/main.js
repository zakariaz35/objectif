import { createApp } from 'vue'
import './style.css'
import './styles/rtl.css' // mirrors the layout when <html dir="rtl"> (Arabic)
import './lib/theme' // apply the saved theme before the first render
import { i18n } from './lib/i18n' // set locale + <html dir> before the first render
import App from './App.vue'
import router from './router'

createApp(App).use(router).use(i18n).mount('#app')
