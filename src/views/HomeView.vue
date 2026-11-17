<template>
  <div class="home-container">
    <div class="home-card">
      <div class="home-card__icon">
        <IconExamHub size="48" />
      </div>
      <h1>ยินดีต้อนรับสู่ ExamHub</h1>
      <p class="home-card__role">
        เข้าสู่ระบบในฐานะ: <strong>{{ authStore.currentRole === 'student' ? 'นักเรียน (Student)' : 'ครูผู้สอน (Teacher)' }}</strong>
      </p>
      <p class="home-card__session">Session: {{ authStore.session }}</p>

      <div class="home-card__actions">
        <router-link to="/login" class="home-card__btn" @click="handleLogout">
          ออกจากระบบ / กลับสู่หน้าล็อกอิน
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import IconExamHub from '@/components/icons/IconExamHub.vue'

const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>

<style scoped src="@/assets/styles/views/home.css"></style>
