<template>
  <div class="add-student-card">
    <!-- Header -->
    <div class="add-student-header">
      <h2 class="add-student-title">เพิ่มนักเรียน</h2>
      <span class="add-student-badge">รายคน</span>
    </div>

    <!-- Form -->
    <form class="add-student-form" @submit.prevent="handleSubmit">
      <!-- Student code -->
      <div class="form-group">
        <label class="form-label" for="student-id">
          รหัสนักเรียน <span class="form-required">*</span>
        </label>
        <input
          id="student-id"
          v-model="form.studentCode"
          type="text"
          class="form-input"
          placeholder="เช่น 30136"
          required
        />
      </div>

      <!-- Prefix & Full name -->
      <div class="form-grid-prefix-name">
        <div class="form-group">
          <label class="form-label" for="student-prefix">คำนำหน้า</label>
          <select
            id="student-prefix"
            v-model="form.prefix"
            class="form-select"
          >
            <option value="ด.ช.">ด.ช.</option>
            <option value="ด.ญ.">ด.ญ.</option>
            <option value="นาย">นาย</option>
            <option value="น.ส.">น.ส.</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="student-name">
            ชื่อ - นามสกุล <span class="form-required">*</span>
          </label>
          <input
            id="student-name"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="ชื่อและนามสกุล"
            required
          />
        </div>
      </div>

      <!-- Email (ใช้เป็นบัญชีเข้าสู่ระบบ) -->
      <div class="form-group">
        <label class="form-label" for="student-email">
          อีเมลนักเรียน <span class="form-required">*</span>
        </label>
        <input
          id="student-email"
          v-model="form.email"
          type="email"
          class="form-input"
          placeholder="student@school.ac.th"
          required
        />
        <span class="form-hint">ใช้เป็นชื่อผู้ใช้สำหรับเข้าสู่ระบบของนักเรียน</span>
      </div>

      <!-- Classroom -->
      <div class="form-group">
        <label class="form-label" for="student-room">ห้องเรียน</label>
        <select
          id="student-room"
          class="form-select"
          :value="classroomId"
          :disabled="disabled || classrooms.length === 0"
          @change="$emit('update:classroomId', $event.target.value)"
        >
          <option v-if="classrooms.length === 0" value="">
            ยังไม่มีห้องเรียน
          </option>
          <option
            v-for="room in classrooms"
            :key="room.id"
            :value="room.id"
          >
            {{ room.name }}
          </option>
        </select>
      </div>

      <!-- Feedback -->
      <p
        v-if="localError || error"
        class="form-feedback form-feedback--error"
        role="alert"
      >
        <span
          v-if="!localError && errorCode"
          class="form-feedback__code"
        >{{ errorCode }}</span>
        <span>{{ localError || error }}</span>
      </p>
      <div v-else-if="success" class="form-feedback form-feedback--success">
        <strong>เพิ่ม {{ success.name }} เรียบร้อยแล้ว</strong>
        <template v-if="success.temporaryPassword">
          <span>รหัสผ่านชั่วคราว:</span>
          <code class="form-credential">{{ success.temporaryPassword }}</code>
          <span class="form-hint">แจ้งรหัสนี้ให้นักเรียนเพื่อใช้เข้าสู่ระบบครั้งแรก</span>
        </template>
        <span v-else class="form-hint">
          บัญชีนี้มีอยู่แล้ว ระบบผูกเข้าห้องเรียนให้เรียบร้อย
        </span>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button
          type="submit"
          class="form-btn-submit"
          :disabled="submitting || disabled || classrooms.length === 0"
        >
          {{ submitting ? 'กำลังบันทึก...' : 'บันทึกเข้าระบบ' }}
        </button>
        <button
          type="button"
          class="form-btn-reset"
          :disabled="submitting"
          @click="handleReset"
        >
          ล้างข้อมูล
        </button>
      </div>
    </form>

    <!-- Footer helper -->
    <div class="add-student-footer">
      <span>มีรายชื่อหลายคน?</span>
      <a href="#" @click.prevent="$emit('download-template')">
        ดาวน์โหลดแม่แบบ CSV
      </a>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  classrooms: {
    type: Array,
    default: () => []
  },
  classroomId: {
    type: String,
    default: ''
  },
  submitting: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  errorCode: {
    type: String,
    default: ''
  },
  success: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['add-student', 'download-template', 'update:classroomId', 'reset'])

const form = reactive({
  studentCode: '',
  prefix: 'ด.ช.',
  name: '',
  email: ''
})

const localError = ref('')

const handleSubmit = () => {
  localError.value = ''

  const studentCode = form.studentCode.trim()
  const name = form.name.trim()
  const email = form.email.trim()

  if (!studentCode) {
    localError.value = 'กรุณากรอกรหัสนักเรียน'
    return
  }
  if (!name) {
    localError.value = 'กรุณากรอกชื่อ - นามสกุล'
    return
  }
  if (!email) {
    localError.value = 'กรุณากรอกอีเมลนักเรียน'
    return
  }
  if (!props.classroomId) {
    localError.value = 'กรุณาเลือกห้องเรียนก่อน'
    return
  }

  emit('add-student', {
    studentCode,
    fullName: `${form.prefix} ${name}`.trim(),
    email
  })
}

const resetFields = () => {
  form.studentCode = ''
  form.prefix = 'ด.ช.'
  form.name = ''
  form.email = ''
}

const handleReset = () => {
  localError.value = ''
  resetFields()
  emit('reset')
}

// เพิ่มสำเร็จ → ล้างช่องกรอก แต่ยังแสดงกล่องข้อความความสำเร็จไว้
watch(
  () => props.success,
  (value) => {
    if (value) resetFields()
  }
)
</script>

<style scoped src="@/assets/styles/components/add-student-form.css"></style>
