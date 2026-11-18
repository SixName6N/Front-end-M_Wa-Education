<template>
  <div v-if="isOpen" class="eb-modal-overlay" @click.self="$emit('close')">
    <div class="eb-modal-container">
      <!-- Modal Header -->
      <div class="eb-modal-header">
        <div>
          <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--eb-primary);">
            แสดงตัวอย่างข้อสอบ (Student Exam Preview)
          </h3>
          <p style="font-size: 0.8125rem; color: var(--eb-text-muted);">
            {{ metadata.title }} • {{ metadata.subjectCode }}
          </p>
        </div>
        <button
          type="button"
          class="eb-btn--icon"
          @click="$emit('close')"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="eb-modal-body">
        <div style="background: var(--eb-surface); padding: 1rem; border-radius: 0.5rem; display: flex; justify-content: space-between; font-size: 0.875rem;">
          <span>จำนวนข้อสอบทั้งหมด: <strong>{{ questions.length }} ข้อ</strong></span>
          <span>คะแนนเต็ม: <strong>{{ totalScore }} คะแนน</strong></span>
          <span>เวลาสอบ: <strong>{{ metadata.durationMinutes }} นาที</strong></span>
        </div>

        <div
          v-for="(q, idx) in questions"
          :key="q.id"
          class="eb-card"
          style="border: 1px solid var(--eb-surface-high);"
        >
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="eb-badge-number">{{ idx + 1 }}</span>
              <span style="font-weight: 600; color: var(--eb-text-main);">
                ข้อที่ {{ idx + 1 }} ({{ q.score }} คะแนน)
              </span>
            </div>
            <span class="eb-badge-score">{{ q.typeName }}</span>
          </div>

          <div style="font-size: 1rem; color: var(--eb-text-main); margin-top: 0.5rem; font-weight: 500;">
            {{ q.prompt }}
          </div>

          <!-- Multiple Choice preview -->
          <div v-if="q.choices" class="eb-choices-list" style="margin-top: 0.5rem;">
            <div
              v-for="c in q.choices"
              :key="c.id"
              class="eb-choice-item"
            >
              <label class="eb-choice-label">
                <input type="radio" :name="`preview_modal_${q.id}`" />
                <span class="eb-choice-text">{{ c.label }} {{ c.text }}</span>
              </label>
            </div>
          </div>

          <!-- Short answer preview -->
          <div v-else-if="q.acceptableKeys" style="margin-top: 0.5rem;">
            <input
              type="text"
              class="eb-input-text"
              placeholder="พิมพ์คำตอบของคุณที่นี่..."
              disabled
            />
          </div>

          <!-- Essay preview -->
          <div v-else-if="q.rubrics" style="margin-top: 0.5rem;">
            <textarea
              class="eb-textarea"
              style="border: 1px solid var(--eb-surface-high);"
              placeholder="พิมพ์คำตอบบรรยายของคุณที่นี่..."
              rows="3"
              disabled
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="eb-modal-footer">
        <button
          type="button"
          class="eb-btn eb-btn--secondary"
          @click="$emit('close')"
        >
          ปิดหน้าต่างตัวอย่าง
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Object,
    required: true
  },
  questions: {
    type: Array,
    required: true
  }
})

defineEmits(['close'])

const totalScore = computed(() => {
  return props.questions.reduce((sum, q) => sum + (Number(q.score) || 0), 0)
})
</script>
