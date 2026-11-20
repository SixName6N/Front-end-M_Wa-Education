<template>
  <div class="exam-card">
    <!-- Header: Subject badge & status -->
    <div class="exam-card__header">
      <span
        class="exam-card__subject-badge"
        :class="{ 'exam-card__subject-badge--orange': exam.subject === 'สังคมศึกษา' }"
      >
        {{ exam.code }} • {{ exam.subject }}
      </span>

      <!-- Status indicator -->
      <span class="exam-card__status" :class="`exam-card__status--${exam.type}`">
        <span v-if="exam.type === 'open'" class="exam-card__status-dot"></span>
        <span v-else-if="exam.type === 'upcoming'">⏰</span>
        <span v-else-if="exam.type === 'completed'">✓</span>
        <span>{{ exam.statusText }}</span>
      </span>
    </div>

    <!-- Body: Title & Teacher info -->
    <div class="exam-card__body">
      <h3 class="exam-card__title">{{ exam.title }}</h3>

      <div class="exam-card__teacher-row">
        <div class="exam-card__teacher-avatar">
          <IconUser size="16" />
        </div>
        <div class="exam-card__teacher-info">
          <span class="exam-card__teacher-name">{{ exam.teacher }}</span>
          <span class="exam-card__teacher-dept">{{ exam.department }}</span>
        </div>
      </div>
    </div>

    <!-- Open / Upcoming Meta & Schedule Box -->
    <template v-if="exam.type === 'open' || exam.type === 'upcoming'">
      <!-- Meta grid: Duration, Questions, Score -->
      <div class="exam-card__meta-grid">
        <div class="exam-card__meta-item">
          <span class="exam-card__meta-icon">⏱️</span>
          <span>{{ exam.duration }}</span>
        </div>
        <div class="exam-card__meta-item">
          <span class="exam-card__meta-icon">📝</span>
          <span>{{ exam.questions }}</span>
        </div>
        <div class="exam-card__meta-item">
          <span class="exam-card__meta-icon">🏆</span>
          <span>เต็ม {{ exam.maxScore }}</span>
        </div>
      </div>

      <!-- Schedule / Deadline row -->
      <div
        class="exam-card__schedule-row"
        :class="{ 'exam-card__schedule-row--warning': exam.isUrgent }"
      >
        <span>{{ exam.deadline }}</span>
        <span v-if="exam.tagText" class="exam-card__schedule-tag">{{ exam.tagText }}</span>
      </div>
    </template>

    <!-- Completed: Score & Feedback Box -->
    <template v-else-if="exam.type === 'completed'">
      <div class="exam-card__score-box">
        <div class="exam-card__score-main">
          <div class="exam-card__score-left">
            <div class="exam-card__score-icon">
              <IconTrophy size="20" />
            </div>
            <div class="exam-card__score-details">
              <span class="exam-card__score-label">คะแนนที่คุณได้</span>
              <span class="exam-card__score-value">
                {{ exam.score }} <span>/ {{ exam.maxScore }} คะแนน</span>
              </span>
            </div>
          </div>

          <div class="exam-card__score-right">
            <span class="exam-card__grade-badge">{{ exam.grade }}</span>
            <span class="exam-card__submit-date">{{ exam.submittedAt }}</span>
          </div>
        </div>

        <div class="exam-card__score-subline">
          <span>{{ exam.summaryText }}</span>
          <span class="exam-card__eval-status">{{ exam.evaluationText }}</span>
        </div>
      </div>
    </template>

    <!-- Footer: Note & Action Button -->
    <div class="exam-card__footer">
      <div class="exam-card__footer-note">
        <IconLock v-if="exam.type === 'open' || exam.type === 'upcoming'" size="13" />
        <IconFileText v-else size="13" />
        <span>{{ exam.footerNote }}</span>
      </div>

      <!-- Button depending on type -->
      <button
        v-if="exam.type === 'open'"
        type="button"
        class="exam-card__btn exam-card__btn--primary"
        :disabled="busy"
        @click="$emit('start-exam', exam)"
      >
        <span v-if="busy" class="exam-card__btn-spinner"></span>
        <span>{{ busy ? 'กำลังเข้าห้องสอบ...' : exam.buttonText }}</span>
        <IconArrowRight v-if="!busy" size="14" />
      </button>

      <button
        v-else-if="exam.type === 'upcoming'"
        type="button"
        class="exam-card__btn exam-card__btn--locked"
        disabled
      >
        <IconLock size="14" />
        <span>{{ exam.buttonText }}</span>
      </button>

      <button
        v-else-if="exam.type === 'completed'"
        type="button"
        class="exam-card__btn exam-card__btn--review"
        @click="$emit('review-exam', exam)"
      >
        <span>{{ exam.buttonText }}</span>
        <IconEye size="14" />
      </button>
    </div>
  </div>
</template>

<script setup>
import IconUser from '@/components/icons/IconUser.vue'
import IconLock from '@/components/icons/IconLock.vue'
import IconFileText from '@/components/icons/IconFileText.vue'
import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import IconEye from '@/components/icons/IconEye.vue'
import IconTrophy from '@/components/icons/IconTrophy.vue'

defineProps({
  exam: {
    type: Object,
    required: true
  },
  /** กำลังเริ่มทำข้อสอบ (ปุ่มถูกกดอยู่) — ปิดปุ่มกันกดซ้ำ */
  busy: {
    type: Boolean,
    default: false
  }
})

defineEmits(['start-exam', 'review-exam'])
</script>

<style scoped src="@/assets/styles/components/exam-card.css"></style>
