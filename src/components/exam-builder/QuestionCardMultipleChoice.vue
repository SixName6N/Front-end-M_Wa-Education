<template>
  <article class="eb-card">
    <!-- Top Bar -->
    <div class="eb-card__top">
      <div class="eb-card__index-info">
        <span class="eb-badge-number">{{ index }}</span>
        <div>
          <span class="eb-card__type-title">ข้อที่ {{ index }} • {{ question.typeName || 'ปรนัย (Multiple Choice)' }}</span>
          <span class="eb-badge-score">{{ question.score }} คะแนน</span>
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

    <!-- Answer Choices -->
    <div class="eb-choices-list">
      <div
        v-for="choice in question.choices"
        :key="choice.id"
        class="eb-choice-item"
        :class="{ 'eb-choice-item--correct': choice.isCorrect }"
      >
        <label class="eb-choice-label">
          <input
            type="radio"
            :name="`preview_choice_${question.id}`"
            :checked="choice.isCorrect"
            disabled
          />
          <span
            class="eb-choice-text"
            :class="{ 'eb-choice-text--correct': choice.isCorrect }"
          >
            {{ choice.label }} {{ choice.text }}
          </span>
        </label>

        <span v-if="choice.isCorrect" class="eb-badge-correct">
          <span class="material-symbols-outlined text-[14px]">check_circle</span>
          คำตอบที่ถูกต้อง
        </span>
      </div>
    </div>

    <!-- Meta / Footer Options -->
    <div class="eb-card__meta-footer">
      <label class="eb-choice-label" style="width: auto;">
        <input
          type="checkbox"
          v-model="question.shuffleChoices"
          @change="$emit('update')"
        />
        <span>สลับตำแหน่งช้อยส์อัตโนมัติ (Shuffle choices)</span>
      </label>

      <button
        type="button"
        class="eb-btn eb-btn--ghost"
        style="padding: 0.2rem 0.5rem; font-size: 0.75rem;"
        @click="showExplanation = !showExplanation"
      >
        <span class="material-symbols-outlined text-[14px]">help</span>
        <span>{{ showExplanation ? 'ซ่อนคำอธิบายเฉลย' : 'คำอธิบายเฉลยเพิ่มเติม (Optional)' }}</span>
      </button>
    </div>

    <!-- Optional Explanation Box -->
    <div
      v-if="showExplanation && question.explanation"
      class="eb-keys-container"
      style="margin-top: 0.25rem;"
    >
      <span class="eb-keys-title">
        <span class="material-symbols-outlined text-[16px] text-primary">lightbulb</span>
        คำอธิบายเฉลย:
      </span>
      <p style="font-size: 0.875rem; color: var(--eb-text-main); margin-top: 0.25rem;">
        {{ question.explanation }}
      </p>
    </div>
  </article>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
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

defineEmits(['move-up', 'move-down', 'copy', 'delete', 'update'])

const showExplanation = ref(false)
</script>
