<template>
  <article class="eb-card">
    <!-- Top Bar -->
    <div class="eb-card__top">
      <div class="eb-card__index-info">
        <span class="eb-badge-number">{{ index }}</span>
        <div>
          <span class="eb-card__type-title">ข้อที่ {{ index }} • {{ question.typeName || 'ตอบสั้น (Short Answer)' }}</span>
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

    <!-- Answer Key Configuration Area -->
    <div class="eb-keys-container">
      <span class="eb-keys-title">
        <span class="material-symbols-outlined text-[16px] text-secondary">vpn_key</span>
        คีย์คำตอบที่ยอมรับ (Acceptable Answer Keys):
      </span>

      <div class="eb-keys-row">
        <template v-for="(key, i) in question.acceptableKeys" :key="i">
          <span class="eb-key-pill">
            {{ key }}
            <span class="material-symbols-outlined text-[14px] text-outline">check</span>
          </span>
          <span v-if="i < question.acceptableKeys.length - 1" class="eb-key-or">หรือ</span>
        </template>

        <button
          type="button"
          class="eb-btn eb-btn--ghost"
          style="padding: 0.2rem 0.5rem; font-size: 0.75rem; color: var(--eb-secondary);"
          @click="addAlternateKey"
        >
          <span class="material-symbols-outlined text-[14px]">add</span>
          เพิ่มคำตอบสำรอง
        </button>
      </div>

      <div style="padding-top: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
        <input
          type="checkbox"
          :id="`case_sens_${question.id}`"
          v-model="question.caseInsensitive"
          @change="$emit('update')"
        />
        <label
          :for="`case_sens_${question.id}`"
          style="font-size: 0.75rem; color: var(--eb-text-muted); cursor: pointer;"
        >
          ไม่สนตัวพิมพ์เล็ก-ใหญ่ (Case-insensitive matching)
        </label>
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

const addAlternateKey = () => {
  const newKey = prompt('ระบุคำตอบสำรองที่ยอมรับ:')
  if (newKey && newKey.trim()) {
    props.question.acceptableKeys.push(newKey.trim())
    emit('update')
  }
}
</script>
