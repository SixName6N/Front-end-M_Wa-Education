<template>
  <div class="not-found-view">
    <div class="not-found-card">
      <p class="not-found-card__eyebrow">ข้อผิดพลาด HTTP</p>

      <div class="not-found-card__code" aria-hidden="true">404</div>

      <h1 class="not-found-card__title">ไม่พบหน้าที่คุณต้องการ</h1>
      <p class="not-found-card__message">
        ลิงก์อาจพิมพ์ผิด ถูกย้าย หรือหน้านี้ถูกลบไปแล้ว
      </p>

      <p class="not-found-card__path">
        <span>เส้นทางที่ร้องขอ:</span>
        <code>{{ requestedPath }}</code>
      </p>

      <div class="not-found-card__actions">
        <button
          type="button"
          class="not-found-card__btn not-found-card__btn--ghost"
          @click="goBack"
        >
          <IconArrowLeft size="15" />
          <span>ย้อนกลับ</span>
        </button>

        <router-link
          to="/"
          class="not-found-card__btn not-found-card__btn--primary"
        >
          กลับหน้าหลัก
        </router-link>
      </div>

      <p class="not-found-card__hint">
        หากยังพบปัญหานี้ กรุณาแจ้งผู้ดูแลระบบพร้อมรหัส <strong>404</strong>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IconArrowLeft from '@/components/icons/IconArrowLeft.vue'

const route = useRoute()
const router = useRouter()

const requestedPath = computed(() => route.fullPath || '/')

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped src="@/assets/styles/views/not-found.css"></style>
