<template>
  <div class="social-auth">
    <!-- Divider -->
    <div class="social-auth__divider">
      <span class="social-auth__divider-line"></span>
      <span class="social-auth__divider-text">หรือเข้าสู่ระบบด้วย</span>
      <span class="social-auth__divider-line"></span>
    </div>

    <!-- Provider buttons -->
    <div class="social-auth__buttons">
      <!-- Google Workspace for Education -->
      <button
        type="button"
        class="social-auth__btn"
        @click="$emit('sso', 'google')"
      >
        <span class="social-auth__btn-icon">
          <IconGoogle size="18" />
        </span>
        <span class="social-auth__btn-label">Google Workspace for Education</span>
      </button>

      <!-- D.DOPA -->
      <button
        type="button"
        class="social-auth__btn"
        @click="$emit('sso', 'dopa')"
      >
        <span class="social-auth__btn-icon social-auth__btn-icon--dopa">
          <IconDopa size="18" />
        </span>
        <span class="social-auth__btn-label">ระบบพิสูจน์ตัวตนดิจิทัลภาครัฐ (D.DOPA)</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import IconGoogle from '@/components/icons/IconGoogle.vue'
import IconDopa from '@/components/icons/IconDopa.vue'

defineEmits(['sso'])
</script>

<style scoped src="@/assets/styles/components/social-auth.css"></style>
