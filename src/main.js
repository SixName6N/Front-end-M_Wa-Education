import './assets/styles/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// กู้ session เดิม (ถ้ามี token เก็บอยู่) ก่อน mount
useAuthStore().restore()

app.mount('#app')
