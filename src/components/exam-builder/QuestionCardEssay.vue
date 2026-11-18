<template>
  <article class="eb-card">
    <!-- Top Bar -->
    <div class="eb-card__top">
      <div class="eb-card__index-info">
        <span class="eb-badge-number">{{ index }}</span>
        <div>
          <span class="eb-card__type-title">ข้อที่ {{ index }} • {{ question.typeName || 'เขียนบรรยาย (Essay with Rubric)' }}</span>
          <span class="eb-badge-score eb-badge-score--tertiary">{{ question.score }} คะแนน</span>
        </div>
      </div>

      <!-- Quick Action Controls -->
      <div class="eb-card__actions">
        <button
          type="button"
          class="eb-btn--icon"
          title="เลื่อนขึ้น"
          :disabled="isFirst"
          @click="$emit('move-up')"
        >
          <span class="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
        </button>
        <button
          type="button"
          class="eb-btn--icon"
          title="เลื่อนลง"
          :disabled="isLast"
          @click="$emit('move-down')"
        >
          <span class="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
        </button>
        <button
          type="button"
          class="eb-btn--icon"
          title="คัดลอกข้อสอบ"
          @click="$emit('copy')"
        >
          <span class="material-symbols-outlined text-[18px]">content_copy</span>
        </button>
        <button
          type="button"
          class="eb-btn--icon eb-btn--icon-danger"
          title="ลบข้อสอบ"
          @click="$emit('delete')"
        >
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>

    <!-- Question Prompt -->
    <div class="eb-card__prompt">
      {{ question.prompt }}
    </div>

    <!-- Embedded Rubric Matrix -->
    <div class="eb-rubric-box">
      <div class="eb-rubric-header">
        <span class="eb-rubric-title">
          <span class="material-symbols-outlined text-[18px]">fact_check</span>
          เกณฑ์การให้คะแนนรูบริก (Scoring Rubric):
        </span>
        <button
          type="button"
          class="eb-btn eb-btn--ghost"
          style="padding: 0.2rem 0.5rem; font-size: 0.75rem; color: var(--eb-secondary);"
          @click="editRubric"
        >
          <span class="material-symbols-outlined text-[14px]">edit</span>
          แก้ไขเกณฑ์
        </button>
      </div>

      <!-- Rubric Cards Grid -->
      <div class="eb-rubric-grid">
        <div
          v-for="rubric in question.rubrics"
          :key="rubric.id"
          class="eb-rubric-card"
        >
          <div>
            <span class="eb-rubric-step">{{ rubric.name }}</span>
            <h4 class="eb-rubric-name">{{ rubric.title }}</h4>
            <p class="eb-rubric-desc">{{ rubric.desc }}</p>
          </div>
          <div class="eb-rubric-score">
            {{ Number(rubric.score).toFixed(1) }} คะแนน
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  index: {
    type: Number,
    required: true
  },
  question: {
    type: Object,
    required: true
  },
  isFirst: {
    type: Boolean,
    default: false
  },
  isLast: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['move-up', 'move-down', 'copy', 'delete', 'update'])

const editRubric = () => {
  alert('เปิดหน้าต่างแก้ไขเกณฑ์การให้คะแนนรูบริก (Rubric Editor)')
}
</script>
