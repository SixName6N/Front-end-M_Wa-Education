<template>
  <div class="add-student-card">
    <!-- Header -->
    <div class="add-student-header">
      <h2 class="add-student-title">เพิ่มนักเรียน</h2>
      <span class="add-student-badge">รายคน</span>
    </div>

    <!-- Form -->
    <form class="add-student-form" @submit.prevent="handleSubmit">
      <!-- Row 1: Seat & ID -->
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="student-seat">
            เลขที่ <span class="form-required">*</span>
          </label>
          <input
            id="student-seat"
            v-model="form.seat"
            type="number"
            class="form-input"
            placeholder="เช่น 36"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="student-id">
            รหัสนักเรียน <span class="form-required">*</span>
          </label>
          <input
            id="student-id"
            v-model="form.id"
            type="text"
            class="form-input"
            placeholder="เช่น 30136"
            required
          />
        </div>
      </div>

      <!-- Row 2: Prefix & Full Name -->
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

      <!-- Row 3: Email -->
      <div class="form-group">
        <label class="form-label" for="student-email">อีเมลนักเรียน</label>
        <input
          id="student-email"
          v-model="form.email"
          type="email"
          class="form-input"
          placeholder="student@school.ac.th"
        />
      </div>

      <!-- Row 4: Room -->
      <div class="form-group">
        <label class="form-label" for="student-room">ห้องเรียน</label>
        <select
          id="student-room"
          v-model="form.room"
          class="form-select"
        >
          <option value="m3-1">มัธยมศึกษาปีที่ 3/1 (ห้องปัจจุบัน)</option>
          <option value="m3-2">มัธยมศึกษาปีที่ 3/2</option>
          <option value="m3-3">มัธยมศึกษาปีที่ 3/3</option>
        </select>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="submit" class="form-btn-submit">
          บันทึกรายชื่อ
        </button>
        <button
          type="button"
          class="form-btn-reset"
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
import { reactive } from 'vue'

const emit = defineEmits(['add-student', 'download-template'])

const form = reactive({
  seat: '',
  id: '',
  prefix: 'ด.ช.',
  name: '',
  email: '',
  room: 'm3-1'
})

const handleSubmit = () => {
  if (!form.seat || !form.id || !form.name) return
  emit('add-student', {
    seat: Number(form.seat),
    id: form.id,
    name: `${form.prefix} ${form.name}`,
    email: form.email,
    room: form.room,
    status: 'unsubmitted',
    statusText: 'ยังไม่ส่งข้อสอบ',
    score: null,
    maxScore: 30,
    actionText: 'เตือนส่งงาน'
  })
  handleReset()
}

const handleReset = () => {
  form.seat = ''
  form.id = ''
  form.prefix = 'ด.ช.'
  form.name = ''
  form.email = ''
  form.room = 'm3-1'
}
</script>

<style scoped src="@/assets/styles/components/add-student-form.css"></style>
