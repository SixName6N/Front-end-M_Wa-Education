<template>
  <StudentLayout>
    <div class="student-account-view">
      <!-- หัวหน้าเพจ -->
      <header class="student-account-head">
        <h1 class="student-account-head__title">บัญชีของฉัน</h1>
        <p class="student-account-head__desc">
          เปลี่ยนรหัสผ่านของบัญชีที่กำลังใช้งานอยู่ — ต้องกรอกรหัสผ่านปัจจุบันเพื่อยืนยันตัวตน
        </p>
      </header>

      <div class="student-account-grid">
        <!-- ข้อมูลบัญชี (อ่านอย่างเดียว) -->
        <section class="student-account-card">
          <h2 class="student-account-card__title">ข้อมูลบัญชี</h2>

          <dl class="student-account-info">
            <div class="student-account-info__row">
              <dt>ชื่อ - นามสกุล</dt>
              <dd>{{ accountName }}</dd>
            </div>
            <div class="student-account-info__row">
              <dt>อีเมลที่ใช้เข้าสู่ระบบ</dt>
              <dd class="student-account-info__value--mono">{{ accountEmail }}</dd>
            </div>
            <div class="student-account-info__row">
              <dt>รหัสนักเรียน</dt>
              <dd class="student-account-info__value--mono">{{ accountStudentCode }}</dd>
            </div>
            <div class="student-account-info__row">
              <dt>บทบาท</dt>
              <dd>{{ roleLabel }}</dd>
            </div>
          </dl>
        </section>

        <!-- ฟอร์มเปลี่ยนรหัสผ่าน -->
        <section class="student-account-card">
          <h2 class="student-account-card__title">เปลี่ยนรหัสผ่าน</h2>

          <AppStateNotice
            v-if="errorMessage"
            variant="error"
            title="เปลี่ยนรหัสผ่านไม่สำเร็จ"
            :message="errorMessage"
            compact
          />
          <AppStateNotice
            v-else-if="successMessage"
            variant="info"
            title="เปลี่ยนรหัสผ่านเรียบร้อย"
            :message="successMessage"
            compact
          />

          <form class="student-account-form" novalidate @submit.prevent="handleSubmit">
            <AppInput
              id="current-password"
              v-model="form.currentPassword"
              type="password"
              label="รหัสผ่านปัจจุบัน"
              placeholder="กรอกรหัสผ่านที่ใช้อยู่"
              autocomplete="current-password"
              :error="fieldErrors.currentPassword"
              :disabled="submitting"
            />
            <AppInput
              id="new-password"
              v-model="form.newPassword"
              type="password"
              label="รหัสผ่านใหม่"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              autocomplete="new-password"
              :error="fieldErrors.newPassword"
              :disabled="submitting"
            />
            <AppInput
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              label="ยืนยันรหัสผ่านใหม่"
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              autocomplete="new-password"
              :error="fieldErrors.confirmPassword"
              :disabled="submitting"
            />

            <div class="student-account-form__actions">
              <AppButton type="submit" variant="primary" :loading="submitting">
                บันทึกรหัสผ่านใหม่
              </AppButton>
              <button
                type="button"
                class="student-account-form__reset"
                :disabled="submitting"
                @click="resetForm"
              >
                ล้างฟอร์ม
              </button>
            </div>
          </form>

          <p class="student-account-hint">
            เมื่อเปลี่ยนสำเร็จ ทุกเครื่องที่เข้าสู่ระบบด้วยบัญชีนี้อยู่จะต้องเข้าสู่ระบบใหม่อีกครั้ง
          </p>
        </section>
      </div>
    </div>
  </StudentLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import StudentLayout from '@/layouts/StudentLayout.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppStateNotice from '@/components/common/AppStateNotice.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const fieldErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const errorMessage = ref('')
const successMessage = ref('')
const submitting = ref(false)

const accountName = computed(
  () => authStore.user?.name || authStore.user?.fullName || '—'
)
const accountEmail = computed(() => authStore.user?.email || '—')
const accountStudentCode = computed(() => authStore.user?.studentCode || '—')
const roleLabel = computed(() => {
  if (authStore.isAdmin) return 'ผู้ดูแลระบบ'
  return authStore.currentRole === 'teacher' ? 'ครูผู้สอน' : 'นักเรียน'
})

function clearFieldErrors() {
  fieldErrors.currentPassword = ''
  fieldErrors.newPassword = ''
  fieldErrors.confirmPassword = ''
}

function resetForm() {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  clearFieldErrors()
}

/** ตรวจฝั่ง client ก่อนยิง API (backend ตรวจซ้ำอีกชั้นเสมอ) */
function validateForm() {
  clearFieldErrors()
  let valid = true

  if (!form.currentPassword) {
    fieldErrors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน'
    valid = false
  }

  if (!form.newPassword) {
    fieldErrors.newPassword = 'กรุณากรอกรหัสผ่านใหม่'
    valid = false
  } else if (form.newPassword.length < 8) {
    fieldErrors.newPassword = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร'
    valid = false
  } else if (form.newPassword.length > 72) {
    fieldErrors.newPassword = 'รหัสผ่านใหม่ยาวเกิน 72 ตัวอักษร'
    valid = false
  } else if (form.newPassword === form.currentPassword) {
    fieldErrors.newPassword = 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน'
    valid = false
  }

  if (!form.confirmPassword) {
    fieldErrors.confirmPassword = 'กรุณายืนยันรหัสผ่านใหม่'
    valid = false
  } else if (form.confirmPassword !== form.newPassword) {
    fieldErrors.confirmPassword = 'รหัสผ่านยืนยันไม่ตรงกับรหัสผ่านใหม่'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateForm()) return

  submitting.value = true
  try {
    await authStore.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword
    })
    resetForm()
    successMessage.value =
      'ระบบบันทึกรหัสผ่านใหม่แล้ว — ครั้งถัดไปให้เข้าสู่ระบบด้วยรหัสผ่านใหม่'
  } catch (error) {
    const message = error?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'

    // รหัสผ่านเดิมไม่ถูกต้อง → แสดงที่ช่อง "รหัสผ่านปัจจุบัน" จะได้แก้ได้ตรงจุด
    if (error?.status === 400 && message.includes('รหัสผ่านปัจจุบัน')) {
      fieldErrors.currentPassword = message
    } else {
      errorMessage.value = message
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped src="@/assets/styles/views/student-account.css"></style>
