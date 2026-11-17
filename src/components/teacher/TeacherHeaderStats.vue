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
      <!-- Classroom select -->
      <div class="teacher-header-stats__select-wrapper">
        <select
          :value="selectedRoom"
          class="teacher-header-stats__select"
          @change="$emit('update:selectedRoom', $event.target.value)"
        >
          <option
            v-for="room in rooms"
            :key="room.id"
            :value="room.id"
          >
            {{ room.label }}
          </option>
        </select>
      </div>

      <!-- Metric stats pills -->
      <div class="teacher-header-stats__metrics">
        <div class="teacher-header-stats__metric-item">
          <span class="teacher-header-stats__dot teacher-header-stats__dot--green"></span>
          <span>ส่งแล้ว: <strong>{{ metrics.submitted }}</strong></span>
        </div>

        <span class="teacher-header-stats__sep">|</span>

        <div class="teacher-header-stats__metric-item">
          <span class="teacher-header-stats__dot teacher-header-stats__dot--amber"></span>
          <span>รอตรวจ: <strong>{{ metrics.pendingReview }}</strong></span>
        </div>

        <span class="teacher-header-stats__sep">|</span>

        <div class="teacher-header-stats__metric-item">
          <span class="teacher-header-stats__dot teacher-header-stats__dot--gray"></span>
          <span>ยังไม่ส่ง: <strong>{{ metrics.notSubmitted }}</strong></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import {
  CLASSROOM_OPTIONS,
  TEACHER_METRICS,
  TEACHER_PROFILE
} from '@/constants/teacher.constants'

defineProps({
  selectedRoom: {
    type: String,
    default: 'm3-1'
  }
})

defineEmits(['update:selectedRoom'])

const session = TEACHER_PROFILE.academicSession
const rooms = CLASSROOM_OPTIONS
const metrics = TEACHER_METRICS
</script>

<style scoped src="@/assets/styles/components/teacher-header-stats.css"></style>
