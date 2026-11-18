<template>
  <div class="exam-banner">
    <!-- Left Profile / Academic Session -->
    <div class="exam-banner__info">
      <div class="exam-banner__session-badge">
        <span class="exam-banner__dot"></span>
        <span>{{ displayStudent.academicSession }}</span>
      </div>
      <h1 class="exam-banner__title">{{ displayStudent.fullNameWithClass }}</h1>
    </div>

    <!-- Right Quick Stats Cards -->
    <div class="exam-banner__stats">
      <!-- Open Now -->
      <div class="exam-banner__stat-card">
        <div class="exam-banner__stat-icon exam-banner__stat-icon--open">
          <IconClock size="18" />
        </div>
        <div class="exam-banner__stat-content">
          <span class="exam-banner__stat-number">{{ displayStats.open }}</span>
          <span class="exam-banner__stat-label">เปิดให้สอบตอนนี้</span>
        </div>
      </div>

      <!-- Upcoming -->
      <div class="exam-banner__stat-card">
        <div class="exam-banner__stat-icon exam-banner__stat-icon--upcoming">
          <IconCalendar size="18" />
        </div>
        <div class="exam-banner__stat-content">
          <span class="exam-banner__stat-number">{{ displayStats.upcoming }}</span>
          <span class="exam-banner__stat-label">เร็วๆ นี้</span>
        </div>
      </div>

      <!-- Completed -->
      <div class="exam-banner__stat-card">
        <div class="exam-banner__stat-icon exam-banner__stat-icon--completed">
          <IconCheckCircle size="18" />
        </div>
        <div class="exam-banner__stat-content">
          <span class="exam-banner__stat-number">{{ displayStats.completed }}</span>
          <span class="exam-banner__stat-label">สอบแล้ว/ตรวจแล้ว</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import IconClock from '@/components/icons/IconClock.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'

const props = defineProps({
  student: {
    type: Object,
    default: null
  },
  stats: {
    type: Object,
    default: null
  }
})

const displayStudent = computed(() => ({
  academicSession: props.student?.academicSession || 'ระบบพร้อมใช้งาน • ภาคเรียนปัจจุบัน',
  fullNameWithClass: props.student?.fullNameWithClass || 'ยินดีต้อนรับสู่ระบบสอบออนไลน์'
}))

const displayStats = computed(() => ({
  open: props.stats?.open ?? 0,
  upcoming: props.stats?.upcoming ?? 0,
  completed: props.stats?.completed ?? 0
}))
</script>

<style scoped src="@/assets/styles/components/exam-banner.css"></style>
