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

            </template>
            <template #prefix>
              <IconLock size="18" />
            </template>
          </AppInput>


          <!-- Submit Button -->
          <AppButton
            type="submit"
            variant="primary"
            :block="true"
            :loading="isSubmitting"
          >
            <span>เข้าสู่ระบบ</span>
            <template #icon-right>
              <IconArrowRight size="16" />
            </template>
          </AppButton>
        </form>

        <!-- Registration & IT Support Footnote -->
        <div class="login-card__footer-notes">
          <p class="login-card__helpdesk-note">
            หากพบปัญหาการใช้งาน ติดต่อฝ่ายทะเบียน-วัดผล
          </p>
        </div>
      </div>

      <!-- Security & Exam Guide below the card -->
      <SecurityFooter @guide="handleOpenGuide" />

      <!-- Exam Guide Modal -->
      <div
        v-if="showGuideModal"
        class="login-guide-modal-overlay"
        style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px;"
        @click.self="showGuideModal = false"
      >
        <div style="background: white; border-radius: 12px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0;">คู่มือการสอบ ExamHub</h3>
            <button type="button" style="background:none; border:none; cursor:pointer; font-size: 20px; color: #64748b;" @click="showGuideModal = false">✕</button>
          </div>
          <div style="font-size: 14px; color: #475569; line-height: 1.6; display: flex; flex-direction: column; gap: 12px;">
            <p>1. เข้าสู่ระบบด้วยอีเมลโรงเรียนและรหัสผ่านที่ได้รับจากทางโรงเรียน</p>
            <p>2. ตรวจสอบรายชื่อชุดข้อสอบที่เปิดให้สอบในเมนู "รายการข้อสอบ"</p>
            <p>3. หากเกิดปัญหาการเข้าสู่ระบบหรือลืมรหัสผ่าน กรุณาติดต่อครูผู้สอนหรือฝ่ายทะเบียน-วัดผล</p>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" style="background: #015b7e; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;" @click="showGuideModal = false">
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import RoleSelector from '@/components/auth/RoleSelector.vue'
import SecurityFooter from '@/components/auth/SecurityFooter.vue'
import IconExamHub from '@/components/icons/IconExamHub.vue'
import IconUser from '@/components/icons/IconUser.vue'
import IconLock from '@/components/icons/IconLock.vue'
import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import { APP_CONFIG } from '@/constants/app.constants'
import { ROLE_CONFIG } from '@/constants/auth.constants'
import { useAuth } from '@/composables/useAuth'

const appConfig = APP_CONFIG


const {
  form,
  errors,
  authStore,
  isSubmitting,
  loginSuccessMessage,
  handleRoleChange,
  handleLogin,

} = useAuth()

const currentRoleConfig = computed(() => {
  return ROLE_CONFIG[authStore.currentRole] || ROLE_CONFIG.student
})


const showGuideModal = ref(false)

const handleOpenGuide = () => {
  showGuideModal.value = true
}
</script>

<style scoped src="@/assets/styles/views/login.css"></style>
