<template>
  <article class="eb-card eb-card--active">
    <!-- Active Form Header -->
    <div class="eb-card__top" style="align-items: center;">
      <div class="eb-card__index-info">
        <span class="eb-badge-number eb-badge-number--active">{{ nextIndex }}</span>
        <div>
          <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--eb-primary);">
            + เพิ่มข้อสอบข้อที่ {{ nextIndex }}
          </h3>
          <p style="font-size: 0.75rem; color: var(--eb-text-muted);">
            กำลังแก้ไขข้อมูลข้อสอบใหม่ในชุด
          </p>
        </div>
      </div>

      <!-- Score setting input -->
      <div style="display: flex; align-items: center; gap: 0.5rem; background-color: var(--eb-surface-container); padding: 0.35rem 0.75rem; border-radius: 0.5rem;">
        <label for="new_score_input" style="font-size: 0.8125rem; font-weight: 500; color: var(--eb-text-muted);">
          คะแนนข้อนี้:
        </label>
        <input
          id="new_score_input"
          type="number"
          min="0.5"
          step="0.5"
          v-model.number="form.score"
          style="width: 3.5rem; text-align: center; font-weight: 700; font-size: 0.875rem; background: var(--eb-surface-lowest); border: 1px solid var(--eb-surface-high); border-radius: 0.25rem; padding: 0.2rem;"
        />
        <span style="font-size: 0.8125rem; color: var(--eb-text-main);">คะแนน</span>
      </div>
    </div>

    <!-- Question Type Tabs -->
    <div class="eb-builder-tabs">
      <button
        v-for="t in questionTypes"
        :key="t.id"
        type="button"
        class="eb-tab-btn"
        :class="{ 'eb-tab-btn--active': form.type === t.id }"
        @click="form.type = t.id"
      >
        <span class="material-symbols-outlined text-[16px]">{{ t.icon }}</span>
        <span>{{ t.label }}</span>
      </button>
    </div>

    <!-- Rich Textarea with Quick Format Bar -->
    <div class="eb-rich-editor">
      <!-- Formatting Toolbar -->
      <div class="eb-toolbar">
        <button
          type="button"
          class="eb-toolbar-btn"
          title="ตัวหนา"
          @click="applyFormat('bold')"
        >
          <span class="material-symbols-outlined text-[18px]">format_bold</span>
        </button>
        <button
          type="button"
          class="eb-toolbar-btn"
          title="ตัวเอียง"
          @click="applyFormat('italic')"
        >
          <span class="material-symbols-outlined text-[18px]">format_italic</span>
        </button>
        <button
          type="button"
          class="eb-toolbar-btn"
          title="ตัวขีดเส้นใต้"
          @click="applyFormat('underline')"
        >
          <span class="material-symbols-outlined text-[18px]">format_underlined</span>
        </button>
        <span class="eb-toolbar-divider"></span>
        <button
          type="button"
          class="eb-toolbar-btn"
          title="สูตรคณิตศาสตร์ / วิทยาศาสตร์"
          @click="insertFormula"
        >
          <span class="material-symbols-outlined text-[18px]">functions</span>
        </button>
        <button
          type="button"
          class="eb-toolbar-btn"
          title="แทรกรูปภาพโจทย์"
          @click="insertImage"
        >
          <span class="material-symbols-outlined text-[18px]">image</span>
        </button>
        <button
          type="button"
          class="eb-toolbar-btn"
          title="สัญลักษณ์ทางวิทยาศาสตร์"
          @click="insertSymbol"
        >
          <span class="material-symbols-outlined text-[18px]">science</span>
        </button>
      </div>

      <textarea
        ref="promptTextarea"
        class="eb-textarea"
        v-model="form.prompt"
        :placeholder="`พิมพ์คำถาม หรือข้อความโจทย์ข้อที่ ${nextIndex} ที่นี่... (รองรับการวางรูปภาพและสูตรทางคณิตศาสตร์)`"
        rows="3"
      ></textarea>
    </div>

    <!-- Multiple Choice Options Editor -->
    <div v-if="form.type === 'choice'" class="eb-choices-list">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8125rem; color: var(--eb-text-muted);">
        <span>ตัวเลือกคำตอบ (เลือก Radio หน้ารายการที่เป็นคำตอบที่ถูกต้อง):</span>
        <span style="color: var(--eb-secondary); font-weight: 500;">อย่างน้อย 2 ตัวเลือก</span>
      </div>

      <!-- Choice Items -->
      <div
        v-for="(choice, idx) in form.choices"
        :key="choice.id"
        class="eb-choice-edit-item"
      >
        <input
          type="radio"
          name="active_builder_key"
          :checked="choice.isCorrect"
          @change="setCorrectChoice(idx)"
          title="กำหนดให้ตัวเลือกนี้เป็นข้อถูก"
          style="cursor: pointer;"
        />
        <span class="eb-choice-letter">{{ choice.label }}</span>
        <input
          type="text"
          class="eb-input-text"
          v-model="choice.text"
          :placeholder="`ระบุตัวเลือก ${choice.label}`"
        />
        <span
          v-if="choice.isCorrect"
          class="eb-badge-correct"
          style="padding: 0.15rem 0.5rem; font-size: 0.6875rem;"
        >
          เฉลย
        </span>
        <button
          v-if="form.choices.length > 2"
          type="button"
          class="eb-btn--icon eb-btn--icon-danger"
          title="ลบตัวเลือกนี้"
          @click="removeChoice(idx)"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <!-- Add Choice Button -->
      <div style="padding-top: 0.25rem;">
        <button
          type="button"
          class="eb-btn eb-btn--ghost"
          style="color: var(--eb-secondary); padding: 0.35rem 0.5rem; font-size: 0.8125rem;"
          @click="addChoice"
        >
          <span class="material-symbols-outlined text-[18px]">add_circle</span>
          <span>+ เพิ่มตัวเลือกถัดไป (Add Choice)</span>
        </button>
      </div>
    </div>

    <!-- Short Answer Options Editor -->
    <div v-else-if="form.type === 'short_answer'" class="eb-keys-container">
      <span class="eb-keys-title">
        <span class="material-symbols-outlined text-[16px] text-secondary">vpn_key</span>
        คีย์คำตอบที่ยอมรับ (พิมพ์แล้วกด Enter):
      </span>
      <div class="eb-keys-row">
        <span
          v-for="(k, i) in form.acceptableKeys"
          :key="i"
          class="eb-key-pill"
        >
          {{ k }}
          <button
            type="button"
            @click="form.acceptableKeys.splice(i, 1)"
            style="color: var(--eb-outline); margin-left: 2px;"
          >
            <span class="material-symbols-outlined text-[14px]">close</span>
          </button>
        </span>
        <input
          type="text"
          class="eb-input-text"
          style="width: 160px; padding: 0.25rem 0.5rem;"
          v-model="newKeyInput"
          placeholder="พิมพ์คำตอบแล้ว Enter"
          @keydown.enter.prevent="addKeyFromInput"
        />
      </div>
    </div>

    <!-- Essay Options Editor -->
    <div v-else-if="form.type === 'essay'" class="eb-rubric-box">
      <span class="eb-rubric-title">
        <span class="material-symbols-outlined text-[18px]">fact_check</span>
        เกณฑ์การตรวจข้อเขียน (Rubric):
      </span>
      <p style="font-size: 0.8125rem; color: var(--eb-text-muted);">
        กำหนดคำแนะนำการให้คะแนนสำหรับอาจารย์ผู้ตรวจ หรือสามารถเปิดระบบตรวจข้อเขียนด้วย AI ช่วยตรวจได้
      </p>
    </div>

    <!-- True/False Options Editor -->
    <div v-else-if="form.type === 'true_false'" class="eb-choices-list">
      <div style="font-size: 0.8125rem; color: var(--eb-text-muted);">
        เฉลยคำตอบที่ถูกต้อง:
      </div>
      <div style="display: flex; gap: 1rem; margin-top: 0.25rem;">
        <label class="eb-choice-item" style="flex: 1; cursor: pointer;">
          <input
            type="radio"
            name="tf_answer"
            :checked="form.tfCorrect === true"
            @change="form.tfCorrect = true"
          />
          <span style="font-weight: 600; color: #156634; margin-left: 0.5rem;">✓ ถูกต้อง (True)</span>
        </label>
        <label class="eb-choice-item" style="flex: 1; cursor: pointer;">
          <input
            type="radio"
            name="tf_answer"
            :checked="form.tfCorrect === false"
            @change="form.tfCorrect = false"
          />
          <span style="font-weight: 600; color: var(--eb-error); margin-left: 0.5rem;">✕ ผิด (False)</span>
        </label>
      </div>
    </div>

    <!-- Bottom Action Buttons for Builder Card -->
    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--eb-surface-container);">
      <button
        type="button"
        class="eb-btn eb-btn--ghost"
        @click="$emit('cancel')"
      >
        ยกเลิก
      </button>
      <button
        type="button"
        class="eb-btn eb-btn--primary"
        @click="submitQuestion"
      >
        <span class="material-symbols-outlined text-[18px]">save</span>
        <span>บันทึกข้อนี้เข้าชุด</span>
      </button>
    </div>
  </article>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { QUESTION_TYPES } from '@/constants/exam-builder.constants'

const props = defineProps({
  nextIndex: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const questionTypes = QUESTION_TYPES
const promptTextarea = ref(null)
const newKeyInput = ref('')

const thaiLabels = ['ก.', 'ข.', 'ค.', 'ง.', 'จ.', 'ฉ.']

const form = reactive({
  type: 'choice',
  score: 1,
  prompt: 'เมื่อปล่อยลูกบอลให้ตกอย่างอิสระในแนวดิ่งภายใต้แรงโน้มถ่วงของโลก (โดยไม่คิดแรงต้านอากาศ) ข้อใดกล่าวถูกต้องที่สุด?',
  choices: [
    { id: 'c1', label: 'ก.', text: 'แรงลัพธ์มีค่าเท่ากับศูนย์', isCorrect: true },
    { id: 'c2', label: 'ข.', text: 'วัตถุเคลื่อนที่ด้วยความเร่งคงที่สม่ำเสมอ', isCorrect: false },
    { id: 'c3', label: 'ค.', text: 'มวลของวัตถุมีค่าเป็นศูนย์เมื่ออยู่ในอวกาศ', isCorrect: false },
    { id: 'c4', label: 'ง.', text: 'แรงเสียดทานมีทิศเดียวกับการเคลื่อนที่ของวัตถุ', isCorrect: false }
  ],
  acceptableKeys: ['ความเร่ง', 'g', '9.8'],
  tfCorrect: true
})

const setCorrectChoice = (index) => {
  form.choices.forEach((c, i) => {
    c.isCorrect = i === index
  })
}

const addChoice = () => {
  const nextIdx = form.choices.length
  const label = thaiLabels[nextIdx] || `${nextIdx + 1}.`
  form.choices.push({
    id: `c_${Date.now()}_${nextIdx}`,
    label,
    text: '',
    isCorrect: false
  })
}

const removeChoice = (index) => {
  if (form.choices.length <= 2) return
  form.choices.splice(index, 1)
  // Re-label
  form.choices.forEach((c, i) => {
    c.label = thaiLabels[i] || `${i + 1}.`
  })
  // If no choice is correct, set the first one
  if (!form.choices.some(c => c.isCorrect)) {
    form.choices[0].isCorrect = true
  }
}

const addKeyFromInput = () => {
  if (newKeyInput.value.trim()) {
    form.acceptableKeys.push(newKeyInput.value.trim())
    newKeyInput.value = ''
  }
}

const applyFormat = (format) => {
  if (!form.prompt) return
  if (format === 'bold') form.prompt += ' **ข้อความตัวหนา**'
  else if (format === 'italic') form.prompt += ' *ข้อความตัวเอียง*'
  else if (format === 'underline') form.prompt += ' <u>ข้อความขีดเส้นใต้</u>'
}

const insertFormula = () => {
  form.prompt += ' E = mc²'
}

const insertImage = () => {
  const url = prompt('ระบุ URL รูปภาพโจทย์:')
  if (url) form.prompt += ` ![รูปภาพประกอบ](${url})`
}

const insertSymbol = () => {
  form.prompt += ' λ, π, Δ, Ω'
}

const submitQuestion = () => {
  if (!form.prompt.trim()) {
    alert('กรุณาระบุโจทย์ข้อสอบ')
    return
  }

  const newQuestion = {
    id: Date.now(),
    type: form.type,
    score: Number(form.score) || 1,
    prompt: form.prompt
  }

  if (form.type === 'choice') {
    newQuestion.typeName = 'ปรนัย (Multiple Choice)'
    newQuestion.choices = JSON.parse(JSON.stringify(form.choices))
    newQuestion.shuffleChoices = true
  } else if (form.type === 'short_answer') {
    newQuestion.typeName = 'ตอบสั้น (Short Answer)'
    newQuestion.acceptableKeys = [...form.acceptableKeys]
    newQuestion.caseInsensitive = true
  } else if (form.type === 'essay') {
    newQuestion.typeName = 'เขียนบรรยาย (Essay with Rubric)'
    newQuestion.rubrics = [
      {
        id: `r_${Date.now()}_1`,
        name: 'เกณฑ์ที่ 1',
        title: 'ความถูกต้องของเนื้อหา',
        desc: 'อธิบายหลักการถูกต้องตรงตามวัตถุประสงค์',
        score: Number(form.score) || 1
      }
    ]
  } else if (form.type === 'true_false') {
    newQuestion.typeName = 'ถูก / ผิด (True / False)'
    newQuestion.choices = [
      { id: 'tf_1', label: '✓', text: 'ถูกต้อง (True)', isCorrect: form.tfCorrect === true },
      { id: 'tf_2', label: '✕', text: 'ผิด (False)', isCorrect: form.tfCorrect === false }
    ]
  }

  emit('save', newQuestion)
}
</script>
