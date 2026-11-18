<template>
  <aside class="eb-sidebar-column">
    <!-- CARD 1: Exam Settings & Rules -->
    <section class="eb-sidebar-card">
      <div class="eb-sidebar-card__header">
        <h3 class="eb-sidebar-card__title">
          <span class="material-symbols-outlined text-primary text-[18px]">settings</span>
          ตั้งค่าชุดข้อสอบ (Exam Rules)
        </h3>
        <button
          type="button"
          class="eb-btn eb-btn--ghost"
          style="padding: 0.15rem 0.4rem; font-size: 0.75rem; color: var(--eb-secondary);"
          @click="openSettings"
        >
          ขั้นสูง
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.25rem;">
        <!-- Duration -->
        <div class="eb-sidebar-row">
          <div class="eb-sidebar-row__label">
            <span class="material-symbols-outlined text-outline text-[18px]">timer</span>
            <span>เวลาทำข้อสอบ</span>
          </div>
          <span class="eb-sidebar-row__val">{{ metadata.durationMinutes }} นาที</span>
        </div>

        <!-- Shuffle Questions Toggle -->
        <div class="eb-sidebar-row">
          <div class="eb-sidebar-row__label">
            <span class="material-symbols-outlined text-outline text-[18px]">shuffle</span>
            <span>สลับลำดับข้อสอบ</span>
          </div>
          <button
            type="button"
            class="eb-btn"
            style="padding: 0.15rem 0.6rem; font-size: 0.75rem; border-radius: 9999px;"
            :class="metadata.shuffleQuestions ? 'eb-btn--primary' : 'eb-btn--secondary'"
            @click="metadata.shuffleQuestions = !metadata.shuffleQuestions"
          >
            {{ metadata.shuffleQuestions ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
          </button>
        </div>

        <!-- Due Date -->
        <div class="eb-sidebar-row">
          <div class="eb-sidebar-row__label">
            <span class="material-symbols-outlined text-outline text-[18px]">calendar_today</span>
            <span>กำหนดส่ง</span>
          </div>
          <span style="font-size: 0.75rem; font-weight: 500; color: var(--eb-text-main);">
            {{ metadata.dueDate }}
          </span>
        </div>

        <!-- Exam Target Group -->
        <div class="eb-sidebar-row">
          <div class="eb-sidebar-row__label">
            <span class="material-symbols-outlined text-outline text-[18px]">groups</span>
            <span>กลุ่มผู้มีสิทธิ์สอบ</span>
          </div>
          <span style="font-size: 0.75rem; font-weight: 600; color: var(--eb-primary);">
            {{ metadata.targetGroup }}
          </span>
        </div>
      </div>
    </section>

    <!-- CARD 2: Question Map & Score Breakdown -->
    <section class="eb-sidebar-card">
      <div class="eb-sidebar-card__header">
        <h3 class="eb-sidebar-card__title">
          <span class="material-symbols-outlined text-secondary text-[18px]">analytics</span>
          โครงสร้างคะแนน (Score Map)
        </h3>
        <span style="font-size: 0.75rem; color: var(--eb-text-muted);">
          {{ questions.length }} ข้อ
        </span>
      </div>

      <!-- Total Score Progress Meter -->
      <div class="eb-progress-box">
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem;">
          <span style="color: var(--eb-text-muted);">คะแนนปัจจุบัน</span>
          <span style="font-weight: 700; color: var(--eb-primary);">
            {{ currentTotalScore }} / {{ metadata.targetScore }} คะแนน ({{ percentage }}%)
          </span>
        </div>

        <!-- Progress bar track -->
        <div class="eb-progress-track">
          <div
            class="eb-progress-bar"
            :style="{ width: `${Math.min(percentage, 100)}%` }"
          ></div>
        </div>

        <span style="font-size: 0.75rem; color: var(--eb-text-muted); text-align: right;">
          <template v-if="remainingScore > 0">
            ขาดอีก {{ remainingScore }} คะแนนจะครบชุด
          </template>
          <template v-else-if="remainingScore === 0">
            ✓ ครบเป้าหมาย {{ metadata.targetScore }} คะแนนแล้ว
          </template>
          <template v-else>
            เกินเป้าหมาย +{{ Math.abs(remainingScore) }} คะแนน
          </template>
        </span>
      </div>

      <!-- Question Types Breakdown Table -->
      <div style="display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: var(--eb-text-muted); margin-top: 0.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.25rem 0;">
          <span style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="width: 0.5rem; height: 0.5rem; border-radius: 50%; background-color: var(--eb-primary);"></span>
            <span>ปรนัย 4 ตัวเลือก</span>
          </span>
          <span style="font-weight: 600; color: var(--eb-text-main);">
            {{ breakdown.choice.count }} ข้อ ({{ breakdown.choice.score }} คะแนน)
          </span>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.25rem 0;">
          <span style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="width: 0.5rem; height: 0.5rem; border-radius: 50%; background-color: var(--eb-secondary);"></span>
            <span>ตอบสั้น (Short Answer)</span>
          </span>
          <span style="font-weight: 600; color: var(--eb-text-main);">
            {{ breakdown.short.count }} ข้อ ({{ breakdown.short.score }} คะแนน)
          </span>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.25rem 0;">
          <span style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="width: 0.5rem; height: 0.5rem; border-radius: 50%; background-color: var(--eb-tertiary);"></span>
            <span>เขียนบรรยาย (Rubric)</span>
          </span>
          <span style="font-weight: 600; color: var(--eb-text-main);">
            {{ breakdown.essay.count }} ข้อ ({{ breakdown.essay.score }} คะแนน)
          </span>
        </div>
      </div>

      <!-- Quick Navigation Matrix (Pills) -->
      <div style="padding-top: 0.5rem;">
        <span style="font-size: 0.75rem; color: var(--eb-text-muted); display: block; margin-bottom: 0.375rem;">
          ข้ามไปยังข้อ (Question Matrix):
        </span>
        <div class="eb-matrix-grid">
          <button
            v-for="(q, idx) in questions"
            :key="q.id"
            type="button"
            class="eb-matrix-pill eb-matrix-pill--completed"
            @click="$emit('scroll-to', idx)"
          >
            {{ idx + 1 }}
          </button>

          <!-- Current active editing pill -->
          <button
            type="button"
            class="eb-matrix-pill eb-matrix-pill--active"
            @click="$emit('scroll-to-builder')"
          >
            {{ questions.length + 1 }}*
          </button>

          <!-- Future empty pill -->
          <div class="eb-matrix-pill eb-matrix-pill--empty">
            {{ questions.length + 2 }}
          </div>
        </div>
      </div>
    </section>

    <!-- CARD 3: Quick Import Tools -->
    <section class="eb-sidebar-card">
      <h3 class="eb-sidebar-card__title">
        <span class="material-symbols-outlined text-secondary text-[18px]">bolt</span>
        นำเข้าข้อสอบด่วน (Quick Import)
      </h3>
      <p style="font-size: 0.8125rem; color: var(--eb-text-muted); line-height: 1.4;">
        ลดเวลาการจัดพิมพ์ด้วยระบบแปลงชุดข้อสอบอัตโนมัติ
      </p>

      <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.25rem;">
        <button
          type="button"
          class="eb-import-btn"
          @click="$emit('import-file')"
        >
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="material-symbols-outlined text-primary text-[20px]">upload_file</span>
            <span>นำเข้าไฟล์ Word / Excel / CSV</span>
          </span>
          <span class="material-symbols-outlined text-outline text-[16px]">arrow_forward</span>
        </button>

        <button
          type="button"
          class="eb-import-btn"
          @click="$emit('import-bank')"
        >
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="material-symbols-outlined text-secondary text-[20px]">cloud_sync</span>
            <span>ดึงข้อสอบจากคลังกลาง (Question Bank)</span>
          </span>
          <span class="material-symbols-outlined text-outline text-[16px]">arrow_forward</span>
        </button>
      </div>
    </section>

    <!-- Teacher Help Note -->
    <div class="eb-help-alert">
      <span class="material-symbols-outlined text-[18px] text-secondary" style="flex-shrink: 0; margin-top: 1px;">
        info
      </span>
      <p>
        ระบบบันทึกคำถามและตัวเลือกแบบเรียลไทม์ คุณครูสามารถปิดหน้านี้แล้วกลับมาแก้ต่อได้ทุกเมื่อ
      </p>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  metadata: {
    type: Object,
    required: true
  },
  questions: {
    type: Array,
    required: true
  }
})

defineEmits(['scroll-to', 'scroll-to-builder', 'import-file', 'import-bank'])

const currentTotalScore = computed(() => {
  return props.questions.reduce((sum, q) => sum + (Number(q.score) || 0), 0)
})

const percentage = computed(() => {
  if (!props.metadata.targetScore) return 0
  return Math.round((currentTotalScore.value / props.metadata.targetScore) * 100)
})

const remainingScore = computed(() => {
  return props.metadata.targetScore - currentTotalScore.value
})

const breakdown = computed(() => {
  const res = {
    choice: { count: 0, score: 0 },
    short: { count: 0, score: 0 },
    essay: { count: 0, score: 0 }
  }

  props.questions.forEach((q) => {
    const s = Number(q.score) || 0
    if (q.type === 'choice' || q.type === 'true_false') {
      res.choice.count++
      res.choice.score += s
    } else if (q.type === 'short_answer') {
      res.short.count++
      res.short.score += s
    } else if (q.type === 'essay') {
      res.essay.count++
      res.essay.score += s
    }
  })

  return res
})

const openSettings = () => {
  alert('เปิดหน้าต่างการตั้งค่าขั้นสูง (ข้อกำหนดการสอบ, ความปลอดภัย, IP Restriction)')
}
</script>
