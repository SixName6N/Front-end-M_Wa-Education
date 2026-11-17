<template>
  <div class="auth-layout">
    <!-- Ambient background glows -->
    <div class="auth-layout__glow auth-layout__glow--cyan"></div>
    <div class="auth-layout__glow auth-layout__glow--amber"></div>

    <!-- Top Navigation Header -->
    <header class="auth-layout__header">
      <div class="auth-layout__header-inner">
        <!-- Back Button -->
        <button
          type="button"
          class="auth-layout__back-btn"
          @click="handleBack"
          aria-label="ย้อนกลับ"
        >
          <IconArrowLeft size="16" />
          <span>Back</span>
        </button>

        <!-- Brand Center -->
        <div class="auth-layout__brand">
          <div class="auth-layout__brand-icon">
            <IconExamHub size="18" />
          </div>
          <span class="auth-layout__brand-name">ExamHub</span>
        </div>

        <!-- Language Selector -->
        <div class="auth-layout__lang">
          <button
            type="button"
            class="auth-layout__lang-btn"
            @click="toggleLanguage"
            :title="`Current: ${currentLang.toUpperCase()}`"
          >
            <IconGlobe size="16" />
            <span>{{ currentLang === 'th' ? 'EN' : 'ไทย' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="auth-layout__main">
      <div class="auth-layout__content">
        <slot />
      </div>
    </main>

    <!-- Global Footer -->
    <footer class="auth-layout__footer">
      <div class="auth-layout__footer-inner">
        <div class="auth-layout__copyright">
          © {{ copyrightYear }} ExamHub Assessment Platform. All rights reserved.
        </div>
        <div class="auth-layout__footer-links">
          <a href="/privacy" class="auth-layout__footer-link">Privacy Policy</a>
          <a href="/terms" class="auth-layout__footer-link">Terms of Service</a>
          <a href="/help" class="auth-layout__footer-link">Help Center</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import IconArrowLeft from '@/components/icons/IconArrowLeft.vue'
import IconExamHub from '@/components/icons/IconExamHub.vue'
import IconGlobe from '@/components/icons/IconGlobe.vue'

const router = useRouter()
const { currentLang, toggleLanguage } = useLanguage()
const copyrightYear = 2025

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped src="@/assets/styles/layouts/auth-layout.css"></style>
