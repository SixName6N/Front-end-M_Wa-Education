<template>
  <AuthLayout>
    <div class="login-container">
      <!-- Main Auth Card -->
      <div class="login-card">
        <!-- Top Card Meta Bar: Session Badge + Language Switcher -->
        <div class="login-card__top">
          <AppBadge :dot="true">
            {{ appConfig.SESSION }}
          </AppBadge>

          <div class="login-card__lang-toggle">
            <button
              type="button"
              class="login-card__lang-btn"
              :class="{ 'login-card__lang-btn--active': currentLang === 'th' }"
              @click="setLanguage('th')"
            >
              ไทย
            </button>
            <span class="login-card__lang-sep">|</span>
            <button
              type="button"
              class="login-card__lang-btn"
              :class="{ 'login-card__lang-btn--active': currentLang === 'en' }"
              @click="setLanguage('en')"
            >
              EN
            </button>
          </div>
        </div>

        <!-- Brand Header Section -->
        <div class="login-card__brand">
          <div class="login-card__logo-wrapper">
            <IconExamHub size="30" />
          </div>
          <h1 class="login-card__title">{{ appConfig.NAME }}</h1>
          <p class="login-card__subtitle-th">{{ appConfig.TITLE_TH }}</p>
          <p class="login-card__subtitle-en">{{ appConfig.TITLE_EN }}</p>
        </div>

        <!-- Role Selector Tabs (Student / Teacher) -->
        <div class="login-card__section">
          <RoleSelector
            :current-role="authStore.currentRole"
            @select="handleRoleChange"
          />
        </div>

        <!-- Success notification if any -->
        <div v-if="loginSuccessMessage" class="login-card__alert login-card__alert--success">
          {{ loginSuccessMessage }}
        </div>

        <!-- General error notification if any -->
        <div v-if="authStore.error" class="login-card__alert login-card__alert--error">
          {{ authStore.error }}
        </div>

        <!-- Login Form -->
        <form class="login-card__form" @submit.prevent="handleLogin">
          <!-- Identifier Input (Student ID / Teacher ID / Email) -->
          <AppInput
            id="identifier"
            v-model="form.identifier"
            :label="currentRoleConfig.idLabelTh"
            :placeholder="currentRoleConfig.placeholder"
            :error="errors.identifier"
            autocomplete="username"
          >
            <template #label-right>
              <span class="login-card__field-hint">{{ currentRoleConfig.idLabelEn }}</span>
            </template>
            <template #prefix>
              <IconUser size="18" />
            </template>
          </AppInput>

          <!-- Password Input -->
          <AppInput
            id="password"
            v-model="form.password"
            type="password"
            label="รหัสผ่าน"
            placeholder="••••••••"
            :error="errors.password"
            autocomplete="current-password"
          >
            <template #label-right>
              <a
                href="/forgot-password"
                class="login-card__forgot-link"
                @click.prevent="handleForgotPassword"
              >
                ลืมรหัสผ่าน?
              </a>
            </template>
            <template #prefix>
              <IconLock size="18" />
            </template>
          </AppInput>

          <!-- Remember Me Checkbox -->
          <div class="login-card__options">
            <AppCheckbox v-model="form.rememberMe">
              จดจำการเข้าสู่ระบบบนอุปกรณ์นี้
            </AppCheckbox>
          </div>

          <!-- Submit Button -->
          <AppButton
            type="submit"
            variant="primary"
            :block="true"
            :loading="isSubmitting"
          >
            <span>เข้าสู่ระบบ (Sign In)</span>
            <template #icon-right>
              <IconArrowRight size="16" />
            </template>
          </AppButton>
        </form>

        <!-- Social SSO Login (Google / D.DOPA) -->
        <div class="login-card__section">
          <SocialAuth @sso="handleSSO" />
        </div>

        <!-- Registration & IT Support Footnote -->
        <div class="login-card__footer-notes">
          <div class="login-card__register-row">
            <span class="login-card__register-label">ยังไม่มีบัญชีผู้ใช้?</span>
            <a
              href="/register"
              class="login-card__register-link"
              @click.prevent="handleRegister"
            >
              {{ currentRoleConfig.registerText }}
            </a>
          </div>
          <p class="login-card__helpdesk-note">
            หากพบปัญหาการใช้งาน ติดต่อฝ่ายทะเบียน-วัดผล หรือ IT Helpdesk
          </p>
        </div>
      </div>

      <!-- Security & Exam Guide below the card -->
      <SecurityFooter @guide="handleOpenGuide" />
    </div>
  </AuthLayout>
</template>

<script setup>
import { computed } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppCheckbox from '@/components/common/AppCheckbox.vue'
import RoleSelector from '@/components/auth/RoleSelector.vue'
import SocialAuth from '@/components/auth/SocialAuth.vue'
import SecurityFooter from '@/components/auth/SecurityFooter.vue'
import IconExamHub from '@/components/icons/IconExamHub.vue'
import IconUser from '@/components/icons/IconUser.vue'
import IconLock from '@/components/icons/IconLock.vue'
import IconArrowRight from '@/components/icons/IconArrowRight.vue'

import { APP_CONFIG } from '@/constants/app.constants'
import { ROLE_CONFIG } from '@/constants/auth.constants'
import { useAuth } from '@/composables/useAuth'
import { useLanguage } from '@/composables/useLanguage'

const appConfig = APP_CONFIG
const { currentLang, setLanguage } = useLanguage()

const {
  form,
  errors,
  authStore,
  isSubmitting,
  loginSuccessMessage,
  handleRoleChange,
  handleLogin,
  handleSSO
} = useAuth()

const currentRoleConfig = computed(() => {
  return ROLE_CONFIG[authStore.currentRole] || ROLE_CONFIG.student
})

const handleForgotPassword = () => {
  alert('นำทางไปยังหน้ารีเซ็ตรหัสผ่าน')
}

const handleRegister = () => {
  alert(`นำทางไปยังหน้าลงทะเบียน: ${currentRoleConfig.value.registerText}`)
}

const handleOpenGuide = () => {
  alert('เปิดคู่มือการสอบ ExamHub Assessment Guide')
}
</script>

<style scoped src="@/assets/styles/views/login.css"></style>
