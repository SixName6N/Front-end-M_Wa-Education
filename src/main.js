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

// กู้ session เดิม (ถ้ามี token เก็บอยู่) ก่อนเริ่มนำทาง
// (router guard จะ await promise ตัวเดียวกันนี้ จึงตัดสินสิทธิ์ได้ถูกต้องตั้งแต่เฟรมแรก)
useAuthStore().restore()

// token หมดอายุ/ถูกเพิกถอนกลางทาง → ล้าง session แล้วเด้งกลับหน้า login ทันที
window.addEventListener('examhub:unauthorized', () => {
  useAuthStore().clearSession()
  router.replace({ name: 'login' })
})

app.mount('#app')
