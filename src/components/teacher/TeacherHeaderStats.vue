<template>
  <div class="teacher-header-stats">
    <!-- Left: Title & Breadcrumbs -->
    <div>
      <div class="teacher-header-stats__breadcrumb">
        <span>ห้องเรียน</span>
        <IconChevronRight size="12" />
        <span>{{ session }}</span>
      </div>
      <h1 class="teacher-header-stats__title">จัดการรายชื่อนักเรียน</h1>
    </div>

    <!-- Right: Room selector & Quick metric pills -->
    <div class="teacher-header-stats__controls">
      <!-- Classroom select (โหลดจาก API) -->
      <div class="teacher-header-stats__select-wrapper">
        <select
          :value="selectedRoom"
          class="teacher-header-stats__select"
          :disabled="loading || rooms.length === 0"
          @change="$emit('update:selectedRoom', $event.target.value)"
        >
          <option v-if="rooms.length === 0" value="">
            {{ loading ? 'กำลังโหลดห้องเรียน...' : 'ยังไม่มีห้องเรียน' }}
          </option>
          <option
            v-for="room in rooms"
            :key="room.id"
            :value="room.id"
          >
            {{ room.label }}
          </option>
        </select>
      </div>

      <!-- Metric stats pills (นับจากรายชื่อจริงในห้อง) -->
      <div class="teacher-header-stats__metrics">
        <div class="teacher-header-stats__metric-item">
          <span class="teacher-header-stats__dot teacher-header-stats__dot--green"></span>
          <span>ทั้งหมด: <strong>{{ metrics.total }}</strong></span>
        </div>

        <span class="teacher-header-stats__sep">|</span>

        <div class="teacher-header-stats__metric-item">
          <span class="teacher-header-stats__dot teacher-header-stats__dot--amber"></span>
          <span>ใช้งาน: <strong>{{ metrics.active }}</strong></span>
        </div>

        <span class="teacher-header-stats__sep">|</span>

        <div class="teacher-header-stats__metric-item">
          <span class="teacher-header-stats__dot teacher-header-stats__dot--gray"></span>
          <span>ระงับ: <strong>{{ metrics.inactive }}</strong></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import { TEACHER_PROFILE } from '@/constants/teacher.constants'

defineProps({
  selectedRoom: {
    type: String,
    default: ''
  },
  rooms: {
    type: Array,
    default: () => []
  },
  metrics: {
    type: Object,
    default: () => ({ total: 0, active: 0, inactive: 0 })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:selectedRoom'])

const session = TEACHER_PROFILE.academicSession
</script>

<style scoped src="@/assets/styles/components/teacher-header-stats.css"></style>
