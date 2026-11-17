<template>
  <div class="exam-banner">
    <!-- Left Profile / Academic Session -->
    <div class="exam-banner__info">
      <div class="exam-banner__session-badge">
        <span class="exam-banner__dot"></span>
        <span>{{ student.academicSession }}</span>
      </div>
      <h1 class="exam-banner__title">{{ student.fullNameWithClass }}</h1>
    </div>

    <!-- Right Quick Stats Cards -->
    <div class="exam-banner__stats">
      <!-- Open Now -->
      <div class="exam-banner__stat-card">
        <div class="exam-banner__stat-icon exam-banner__stat-icon--open">
          <IconClock size="18" />
        </div>
        <div class="exam-banner__stat-content">
          <span class="exam-banner__stat-number">{{ stats.open }}</span>
          <span class="exam-banner__stat-label">เปิดให้สอบตอนนี้</span>
        </div>
      </div>

      <!-- Upcoming -->
      <div class="exam-banner__stat-card">
        <div class="exam-banner__stat-icon exam-banner__stat-icon--upcoming">
          <IconCalendar size="18" />
        </div>
        <div class="exam-banner__stat-content">
          <span class="exam-banner__stat-number">{{ stats.upcoming }}</span>
          <span class="exam-banner__stat-label">เร็วๆ นี้</span>
        </div>
      </div>

      <!-- Completed -->
      <div class="exam-banner__stat-card">
        <div class="exam-banner__stat-icon exam-banner__stat-icon--completed">
          <IconCheckCircle size="18" />
        </div>
        <div class="exam-banner__stat-content">
          <span class="exam-banner__stat-number">{{ stats.completed }}</span>
          <span class="exam-banner__stat-label">สอบแล้ว/ตรวจแล้ว</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconClock from '@/components/icons/IconClock.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import { STUDENT_PROFILE, EXAM_STATS } from '@/constants/exam.constants'

const student = STUDENT_PROFILE
const stats = EXAM_STATS
</script>

<style scoped src="@/assets/styles/components/exam-banner.css"></style>
