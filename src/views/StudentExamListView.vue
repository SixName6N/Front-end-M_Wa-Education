<template>
  <StudentLayout>
    <div class="exam-list-view">
      <!-- 1. Hero / Banner -->
      <ExamBanner />

      <!-- 2. Search & Filter Bar -->
      <ExamFilter
        v-model="searchQuery"
        :active-filter="activeFilter"
        @select-filter="handleFilterChange"
      />

      <!-- 3. Section: Currently Open Exams (กำลังเปิดให้สอบ) -->
      <section v-if="shouldShowSection('open')" class="exam-section">
        <div class="exam-section__header">
          <div class="exam-section__title-group">
            <span class="exam-section__dot"></span>
            <h2 class="exam-section__title">
              กำลังเปิดให้สอบ
              <span class="exam-section__badge">{{ filteredOpenExams.length }} รายการ</span>
            </h2>
          </div>
          <span class="exam-section__hint">กรุณาส่งตามกำหนดเวลา</span>
        </div>

        <div v-if="filteredOpenExams.length > 0" class="exam-section__grid">
          <ExamCard
            v-for="exam in filteredOpenExams"
            :key="exam.id"
            :exam="exam"
            @start-exam="handleStartExam"
          />
        </div>
        <div v-else class="exam-section__empty">
          ไม่พบข้อสอบที่กำลังเปิดอยู่ในขณะนี้
        </div>
      </section>

      <!-- 4. Section: Upcoming Exams (กำหนดการสอบเร็วๆ นี้) -->
      <section v-if="shouldShowSection('upcoming')" class="exam-section">
        <div class="exam-section__header">
          <div class="exam-section__title-group">
            <h2 class="exam-section__title">
              📅 กำหนดการสอบเร็วๆ นี้
              <span class="exam-section__badge">{{ filteredUpcomingExams.length }} รายการ</span>
            </h2>
          </div>
          <span class="exam-section__hint">ระบบจะเปิดตามเวลา</span>
        </div>

        <div v-if="filteredUpcomingExams.length > 0" class="exam-section__grid">
          <ExamCard
            v-for="exam in filteredUpcomingExams"
            :key="exam.id"
            :exam="exam"
          />
        </div>
        <div v-else class="exam-section__empty">
          ไม่พบกำหนดการสอบที่กำลังจะมาถึง
        </div>
      </section>

      <!-- 5. Section: Completed Exams (ข้อสอบที่ทำเสร็จแล้ว) -->
      <section v-if="shouldShowSection('completed')" class="exam-section">
        <div class="exam-section__header">
          <div class="exam-section__title-group">
            <h2 class="exam-section__title">
              ✓ ข้อสอบที่ทำเสร็จแล้ว
              <span class="exam-section__badge">{{ filteredCompletedExams.length }} รายการ</span>
            </h2>
          </div>
          <span class="exam-section__hint">สามารถดูเฉลยและจุดที่ผิดได้</span>
        </div>

        <div v-if="filteredCompletedExams.length > 0" class="exam-section__grid">
          <ExamCard
            v-for="exam in filteredCompletedExams"
            :key="exam.id"
            :exam="exam"
            @review-exam="handleReviewExam"
          />
        </div>
        <div v-else class="exam-section__empty">
          ไม่พบประวัติการทำข้อสอบ
        </div>
      </section>

      <!-- 6. Exam Regulations & Guidelines Footer Banner -->
      <ExamGuidelines />
    </div>
  </StudentLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import StudentLayout from '@/layouts/StudentLayout.vue'
import ExamBanner from '@/components/exam/ExamBanner.vue'
import ExamFilter from '@/components/exam/ExamFilter.vue'
import ExamCard from '@/components/exam/ExamCard.vue'
import ExamGuidelines from '@/components/exam/ExamGuidelines.vue'

import {
  OPEN_EXAMS,
  UPCOMING_EXAMS,
  COMPLETED_EXAMS
} from '@/constants/exam.constants'

const searchQuery = ref('')
const activeFilter = ref('all')

const handleFilterChange = (filterId) => {
  activeFilter.value = filterId
}

const shouldShowSection = (sectionType) => {
  if (activeFilter.value === 'all') return true
  return activeFilter.value === sectionType
}

const matchesSearch = (exam) => {
  if (!searchQuery.value.trim()) return true
  const query = searchQuery.value.toLowerCase().trim()
  return (
    exam.title.toLowerCase().includes(query) ||
    exam.code.toLowerCase().includes(query) ||
    exam.subject.toLowerCase().includes(query) ||
    exam.teacher.toLowerCase().includes(query)
  )
}

const filteredOpenExams = computed(() => {
  return OPEN_EXAMS.filter(matchesSearch)
})

const filteredUpcomingExams = computed(() => {
  return UPCOMING_EXAMS.filter(matchesSearch)
})

const filteredCompletedExams = computed(() => {
  return COMPLETED_EXAMS.filter(matchesSearch)
})

const handleStartExam = (exam) => {
  alert(`กำลังนำทางเข้าสู่ห้องสอบ: ${exam.title}`)
}

const handleReviewExam = (exam) => {
  alert(`เปิดดูผลคะแนนและคำอธิบายเฉลย: ${exam.title}`)
}
</script>

<style scoped src="@/assets/styles/views/student-exam-list.css"></style>
