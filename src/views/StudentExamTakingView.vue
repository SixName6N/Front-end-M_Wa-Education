<template>
  <StudentLayout>
    <div class="exam-room">
      <!-- กำลังเตรียมห้องสอบ -->
      <div v-if="loading" class="exam-room__state">
        <div class="exam-room__spinner"></div>
        <p class="exam-room__state-text">กำลังเตรียมห้องสอบ...</p>
      </div>

      <!-- เข้าห้องสอบไม่ได้ (ไม่ได้อยู่ในห้อง / ยังไม่เปิด / จำกัด IP / หมดเวลา / ส่งแล้ว) -->
      <div v-else-if="loadError" class="exam-room__state">
        <AppStateNotice
          variant="error"
          code="เข้าห้องสอบไม่สำเร็จ"
          :title="loadErrorTitle"
          :message="loadError"
        >
          <button type="button" class="exam-room__notice-btn" @click="backToList">
            กลับไปหน้าข้อสอบของฉัน
          </button>
        </AppStateNotice>
      </div>

      <template v-else-if="exam">
        <!-- แถบเครื่องมือด้านบน -->
        <header class="exam-room__bar">
          <button type="button" class="exam-room__exit" @click="confirmExit">
            <IconArrowLeft size="16" />
            <span>ออกจากห้องสอบ</span>
          </button>

          <div class="exam-room__info">
            <h1 class="exam-room__title">{{ exam.title }}</h1>
            <p class="exam-room__meta">
              <span>{{ questions.length }} ข้อ</span>
              <span class="exam-room__dot">•</span>
              <span>{{ exam.timeLimitMinutes ? `เวลาทำ ${exam.timeLimitMinutes} นาที` : 'ไม่จำกัดเวลา' }}</span>
              <span class="exam-room__dot">•</span>
              <span>ทำแล้ว {{ answeredCount }}/{{ questions.length }} ข้อ</span>
            </p>
          </div>

          <div class="exam-room__status">
            <div class="exam-room__timer" :class="timerClass">
              <IconClock size="16" />
              <span v-if="remainingMs === null">ไม่จำกัดเวลา</span>
              <span v-else>{{ formattedRemaining }}</span>
            </div>

            <div class="exam-room__save" :class="`exam-room__save--${saveState}`">
              <span v-if="saveState === 'saving' || saveState === 'pending'">กำลังบันทึก...</span>
              <span v-else-if="saveState === 'saved'">บันทึกแล้ว {{ savedAtText }}</span>
              <span v-else-if="saveState === 'error'">{{ saveError }}</span>
              <span v-else>บันทึกอัตโนมัติ</span>
              <button
                v-if="saveState === 'error'"
                type="button"
                class="exam-room__save-retry"
                @click="flushSave"
              >
                ลองใหม่
              </button>
            </div>

            <AppButton variant="primary" :disabled="isLocked" @click="openSubmitConfirm">
              ส่งข้อสอบ
            </AppButton>
          </div>
        </header>

        <!-- แจ้งเตือน: หมดเวลา / ถูกระงับการแก้ไข -->
        <AppStateNotice
          v-if="timeUp && !submitted"
          variant="error"
          code="หมดเวลา"
          title="หมดเวลาทำข้อสอบแล้ว"
          message="ระบบหยุดรับการแก้ไขคำตอบแล้ว แต่ยังกด “ส่งข้อสอบ” เพื่อส่งคำตอบที่มีอยู่ได้"
          compact
        />
        <AppStateNotice
          v-else-if="frozenMessage"
          variant="error"
          code="ระงับการแก้ไข"
          :title="frozenMessage"
          message="ไม่สามารถบันทึกคำตอบเพิ่มได้ — กรุณากด “ส่งข้อสอบ”"
          compact
        />

        <div class="exam-room__layout">
          <!-- โจทย์ -->
          <main class="exam-room__main">
            <div class="exam-room__mode">
              <span class="exam-room__mode-label">มุมมอง:</span>
              <button
                type="button"
                class="exam-room__mode-btn"
                :class="{ 'exam-room__mode-btn--active': displayMode === 'SINGLE_PAGE' }"
                :disabled="isLocked"
                @click="setDisplayMode('SINGLE_PAGE')"
              >
                ทั้งชุด
              </button>
              <button
                type="button"
                class="exam-room__mode-btn"
                :class="{ 'exam-room__mode-btn--active': displayMode === 'PAGINATED' }"
                :disabled="isLocked"
                @click="setDisplayMode('PAGINATED')"
              >
                ทีละหน้า ({{ questionsPerPage }} ข้อ)
              </button>
            </div>

            <article
              v-for="question in visibleQuestions"
              :id="`question-${question.id}`"
              :key="question.id"
              class="question-card"
              :class="{ 'question-card--answered': isAnswered(question) }"
            >
              <header class="question-card__head">
                <span class="question-card__no">
                  ข้อ {{ numberById.get(question.id) }}
                </span>
                <span class="question-card__type">{{ typeLabel(question.type) }}</span>
                <span v-if="isAnswered(question)" class="question-card__answered">
                  <IconCheckCircle size="14" />
                  <span>ตอบแล้ว</span>
                </span>
              </header>

              <p class="question-card__prompt">{{ question.prompt }}</p>

              <!-- ปรนัย -->
              <div v-if="question.type === 'MULTIPLE_CHOICE'" class="question-card__choices">
                <label
                  v-for="(choice, index) in question.choices"
                  :key="choice.id"
                  class="choice"
                  :class="{ 'choice--selected': answerOf(question.id).choiceId === choice.id }"
                >
                  <input
                    type="radio"
                    class="choice__input"
                    :name="`question-${question.id}`"
                    :value="choice.id"
                    :checked="answerOf(question.id).choiceId === choice.id"
                    :disabled="isLocked"
                    @change="selectChoice(question.id, choice.id)"
                  />
                  <span class="choice__label">{{ choice.label || String.fromCharCode(65 + index) }}</span>
                  <span class="choice__text">{{ choice.text }}</span>
                </label>
              </div>

              <!-- อัตนัย -->
              <div v-else class="question-card__text">
                <textarea
                  class="question-card__textarea"
                  :value="answerOf(question.id).textAnswer"
                  :disabled="isLocked"
                  :rows="question.type === 'LONG_ANSWER' ? 6 : 3"
                  maxlength="20000"
                  placeholder="พิมพ์คำตอบที่นี่..."
                  @input="onTextInput(question.id, $event.target.value)"
                ></textarea>
                <span class="question-card__counter">
                  {{ (answerOf(question.id).textAnswer || '').length }} / 20000 ตัวอักษร
                </span>
              </div>
            </article>

            <!-- ตัวแบ่งหน้า (โหมดทีละหน้า) -->
            <div v-if="displayMode === 'PAGINATED' && totalPages > 1" class="exam-room__pager">
              <button
                type="button"
                class="exam-room__pager-btn"
                :disabled="pageIndex === 0"
                @click="goToPage(pageIndex - 1)"
              >
                <IconChevronLeft size="16" />
                <span>ก่อนหน้า</span>
              </button>
              <span class="exam-room__pager-text">
                หน้า {{ pageIndex + 1 }} / {{ totalPages }}
              </span>
              <button
                type="button"
                class="exam-room__pager-btn"
                :disabled="pageIndex >= totalPages - 1"
                @click="goToPage(pageIndex + 1)"
              >
                <span>ถัดไป</span>
                <IconChevronRight size="16" />
              </button>
            </div>
          </main>

          <!-- แผงนำทางข้อ -->
          <aside class="exam-room__side">
            <div class="exam-room__nav">
              <h2 class="exam-room__nav-title">กระดาษคำตอบ</h2>
              <p class="exam-room__nav-sub">
                ตอบแล้ว {{ answeredCount }} / {{ questions.length }} ข้อ
              </p>

              <div class="exam-room__nav-grid">
                <button
                  v-for="(question, index) in questions"
                  :key="question.id"
                  type="button"
                  class="exam-room__nav-item"
                  :class="{
                    'exam-room__nav-item--answered': isAnswered(question),
                    'exam-room__nav-item--current': isCurrent(question)
                  }"
                  :title="`ไปยังข้อ ${index + 1}`"
                  @click="goToQuestion(index)"
                >
                  {{ index + 1 }}
                </button>
              </div>

              <ul class="exam-room__legend">
                <li><span class="exam-room__legend-dot exam-room__legend-dot--answered"></span> ตอบแล้ว</li>
                <li><span class="exam-room__legend-dot"></span> ยังไม่ตอบ</li>
              </ul>

              <AppButton variant="primary" block :disabled="isLocked" @click="openSubmitConfirm">
                ส่งข้อสอบ
              </AppButton>
            </div>
          </aside>
        </div>
      </template>

      <!-- ยืนยันการส่งข้อสอบ -->
      <div v-if="showSubmitConfirm" class="exam-modal">
        <div class="exam-modal__card">
          <h2 class="exam-modal__title">ยืนยันการส่งข้อสอบ</h2>
          <p class="exam-modal__text">
            ส่งแล้วจะแก้ไขคำตอบไม่ได้อีก — ตรวจสอบให้ครบก่อนกดยืนยัน
          </p>

          <div class="exam-modal__stats">
            <div class="exam-modal__stat">
              <span class="exam-modal__stat-value">{{ answeredCount }}</span>
              <span class="exam-modal__stat-label">ตอบแล้ว</span>
            </div>
            <div class="exam-modal__stat">
              <span class="exam-modal__stat-value exam-modal__stat-value--warn">
                {{ questions.length - answeredCount }}
              </span>
              <span class="exam-modal__stat-label">ยังไม่ตอบ</span>
            </div>
          </div>

          <p v-if="unansweredNumbers.length" class="exam-modal__unanswered">
            ข้อที่ยังไม่ได้ตอบ: {{ unansweredNumbers.join(', ') }}
          </p>

          <p v-if="submitError" class="exam-modal__error">{{ submitError }}</p>

          <div class="exam-modal__actions">
            <AppButton variant="outline" :disabled="submitting" @click="showSubmitConfirm = false">
              กลับไปทำต่อ
            </AppButton>
            <AppButton variant="primary" :loading="submitting" @click="confirmSubmit">
              ยืนยันส่งข้อสอบ
            </AppButton>
          </div>
        </div>
      </div>

      <!-- ส่งสำเร็จ -->
      <div v-if="submitted" class="exam-modal">
        <div class="exam-modal__card exam-modal__card--success">
          <div class="exam-modal__icon">
            <IconCheckCircle size="34" />
          </div>
          <h2 class="exam-modal__title">ส่งข้อสอบเรียบร้อยแล้ว</h2>
          <p class="exam-modal__text">
            ระบบบันทึกคำตอบของคุณแล้ว — จะเห็นคะแนนเมื่อครูผู้สอนกดปล่อยผลสอบ
          </p>
          <div class="exam-modal__actions">
            <AppButton variant="primary" block @click="backToList">
              กลับไปหน้าข้อสอบของฉัน
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </StudentLayout>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

import StudentLayout from '@/layouts/StudentLayout.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppStateNotice from '@/components/common/AppStateNotice.vue'
import IconArrowLeft from '@/components/icons/IconArrowLeft.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import IconClock from '@/components/icons/IconClock.vue'

import { studentExamService } from '@/services/studentExamService'
import { useAuthStore } from '@/stores/authStore'

/** หน่วงก่อนบันทึกอัตโนมัติ (ms) — กันยิง API ถี่เกินไปตอนพิมพ์/กดตัวเลือก */
const SAVE_DEBOUNCE_MS = 800
const TYPE_LABELS = {
  MULTIPLE_CHOICE: 'ปรนัย',
  SHORT_ANSWER: 'อัตนัย (ตอบสั้น)',
  LONG_ANSWER: 'อัตนัย (ตอบยาว)'
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const examId = computed(() => String(route.params.examId || ''))

const loading = ref(true)
const loadError = ref('')
const loadErrorTitle = ref('เข้าห้องสอบไม่สำเร็จ')

const exam = ref(null)
const submission = ref(null)

/** { [questionId]: { choiceId: string|null, textAnswer: string } } */
const answers = ref({})
/** เฉพาะข้อที่เปลี่ยนรอรอบันทึก (ไม่ต้องเป็น reactive) */
const dirtyIds = new Set()

const saveState = ref('idle') // idle | pending | saving | saved | error
const saveError = ref('')
const lastSavedAt = ref(null)

const displayMode = ref('SINGLE_PAGE')
const pageIndex = ref(0)

const remainingMs = ref(null)
const timeUp = ref(false)
const frozenMessage = ref('')

const showSubmitConfirm = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const submitError = ref('')

let saveTimer = null
let timerId = null

// ---------------------------------------------------------------------------
// computed
// ---------------------------------------------------------------------------
const questions = computed(() => exam.value?.questions ?? [])

const questionsPerPage = computed(() => {
  const value = Number(exam.value?.questionsPerPage)
  return Number.isFinite(value) && value > 0 ? value : 5
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(questions.value.length / questionsPerPage.value))
)

const visibleQuestions = computed(() => {
  if (displayMode.value !== 'PAGINATED') return questions.value
  const start = pageIndex.value * questionsPerPage.value
  return questions.value.slice(start, start + questionsPerPage.value)
})

const numberById = computed(() => {
  const map = new Map()
  questions.value.forEach((question, index) => map.set(question.id, index + 1))
  return map
})

const answeredCount = computed(() => questions.value.filter((question) => isAnswered(question)).length)

const unansweredNumbers = computed(() =>
  questions.value
    .map((question, index) => (isAnswered(question) ? null : index + 1))
    .filter((value) => value !== null)
)

const formattedRemaining = computed(() => {
  if (remainingMs.value === null) return ''
  const totalSeconds = Math.max(0, Math.floor(remainingMs.value / 1000))
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
})

const timerClass = computed(() => {
  if (remainingMs.value === null || remainingMs.value <= 0) return ''
  if (remainingMs.value <= 60_000) return 'exam-room__timer--danger'
  if (remainingMs.value <= 5 * 60_000) return 'exam-room__timer--warning'
  return ''
})

/** ล็อกการแก้ไข: หมดเวลา / ส่งแล้ว / เซิร์ฟเวอร์ไม่รับบันทึกแล้ว */
const isLocked = computed(
  () => submitting.value || submitted.value || timeUp.value || Boolean(frozenMessage.value)
)

const savedAtText = computed(() => {
  if (!lastSavedAt.value) return ''
  return lastSavedAt.value.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
})

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function answerOf(questionId) {
  return answers.value[questionId] ?? { choiceId: null, textAnswer: '' }
}

function isAnswered(question) {
  const answer = answerOf(question.id)
  if (question.type === 'MULTIPLE_CHOICE') return Boolean(answer.choiceId)
  return Boolean((answer.textAnswer || '').trim())
}

function typeLabel(type) {
  return TYPE_LABELS[type] || type
}

function isCurrent(question) {
  if (displayMode.value !== 'PAGINATED') return false
  const index = numberById.value.get(question.id) ?? 0
  const start = pageIndex.value * questionsPerPage.value
  return index > start && index <= start + questionsPerPage.value
}

// ---------------------------------------------------------------------------
// answering + autosave
// ---------------------------------------------------------------------------
function selectChoice(questionId, choiceId) {
  if (isLocked.value) return
  answers.value = {
    ...answers.value,
    [questionId]: { ...answerOf(questionId), choiceId }
  }
  queueSave(questionId)
}

function onTextInput(questionId, value) {
  if (isLocked.value) return
  answers.value = {
    ...answers.value,
    [questionId]: { ...answerOf(questionId), textAnswer: value }
  }
  queueSave(questionId)
}

function queueSave(questionId) {
  dirtyIds.add(questionId)
  saveState.value = 'pending'
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    flushSave()
  }, SAVE_DEBOUNCE_MS)
}

/** ส่งคำตอบที่ค้างอยู่ขึ้นเซิร์ฟเวอร์ (เรียกได้ทั้งจาก debounce และตอนกดส่งข้อสอบ) */
async function flushSave() {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  if (!submission.value || dirtyIds.size === 0) return

  const ids = [...dirtyIds]
  dirtyIds.clear()

  const payload = ids.map((id) => {
    const answer = answerOf(id)
    return {
      questionId: id,
      choiceId: answer.choiceId ?? null,
      textAnswer: answer.textAnswer ?? null
    }
  })

  saveState.value = 'saving'
  saveError.value = ''

  try {
    await studentExamService.saveAnswers(submission.value.id, payload)
    saveState.value = 'saved'
    lastSavedAt.value = new Date()
  } catch (err) {
    // เก็บกลับเข้า dirty เพื่อให้กด "ลองใหม่" ได้
    ids.forEach((id) => dirtyIds.add(id))
    saveState.value = 'error'
    saveError.value = err?.message || 'บันทึกคำตอบไม่สำเร็จ'
    if (err?.status === 409) frozenMessage.value = err.message
  }
}

// ---------------------------------------------------------------------------
// navigation in exam
// ---------------------------------------------------------------------------
function setDisplayMode(mode) {
  if (isLocked.value || displayMode.value === mode) return
  displayMode.value = mode
  pageIndex.value = 0
}

function goToPage(index) {
  pageIndex.value = Math.min(Math.max(index, 0), totalPages.value - 1)
}

async function goToQuestion(index) {
  const question = questions.value[index]
  if (!question) return
  if (displayMode.value === 'PAGINATED') {
    pageIndex.value = Math.floor(index / questionsPerPage.value)
  }
  await nextTick()
  document.getElementById(`question-${question.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ---------------------------------------------------------------------------
// timer
// ---------------------------------------------------------------------------
function startTimer() {
  if (!submission.value?.expiresAt) {
    remainingMs.value = null
    return
  }

  const tick = () => {
    const left = new Date(submission.value.expiresAt).getTime() - Date.now()
    remainingMs.value = Math.max(0, left)
    if (left <= 0) {
      timeUp.value = true
      if (timerId) {
        clearInterval(timerId)
        timerId = null
      }
    }
  }

  tick()
  timerId = setInterval(tick, 1000)
}

// ---------------------------------------------------------------------------
// submit / exit
// ---------------------------------------------------------------------------
function openSubmitConfirm() {
  if (isLocked.value) return
  submitError.value = ''
  showSubmitConfirm.value = true
}

async function confirmSubmit() {
  if (submitting.value || !submission.value) return
  submitting.value = true
  submitError.value = ''

  try {
    // ให้คำตอบที่ค้างอยู่ถูกบันทึกก่อน (ถ้าบันทึกไม่ได้เพราะหมดเวลา ระบบยังให้ส่งได้)
    await flushSave()
    await studentExamService.submitSubmission(submission.value.id, { displayMode: displayMode.value })
    submitted.value = true
    showSubmitConfirm.value = false
    dirtyIds.clear()
    stopTimer()
  } catch (err) {
    submitError.value = err?.message || 'ส่งข้อสอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    submitting.value = false
  }
}

function backToList() {
  router.push({ name: 'student-exams' })
}

function confirmExit() {
  const ok = window.confirm(
    'ออกจากห้องสอบตอนนี้? ระบบบันทึกคำตอบที่ทำไว้แล้ว — กลับเข้ามาทำต่อได้ก่อนหมดเวลา'
  )
  if (ok) backToList()
}

function handleBeforeUnload(event) {
  if (submitted.value || !submission.value) return
  event.preventDefault()
  event.returnValue = ''
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

// ---------------------------------------------------------------------------
// lifecycle
// ---------------------------------------------------------------------------
function initAnswers(list) {
  const map = {}
  for (const question of list) {
    map[question.id] = {
      choiceId: question.myAnswer?.choiceId ?? null,
      textAnswer: question.myAnswer?.textAnswer ?? ''
    }
  }
  answers.value = map
}

async function load() {
  loading.value = true
  loadError.value = ''
  loadErrorTitle.value = 'เข้าห้องสอบไม่สำเร็จ'

  try {
    // เริ่ม (หรือทำต่อจากใบเดิม) — ตรวจสิทธิ์/เวลา/IP ให้ฝั่งเซิร์ฟเวอร์เป็นคนตัดสิน
    const started = await studentExamService.startSubmission(examId.value)
    submission.value = started

    const detail = await studentExamService.getExamDetail(examId.value)
    exam.value = detail
    initAnswers(detail.questions ?? [])
    displayMode.value = started?.displayMode || detail.defaultDisplayMode || 'SINGLE_PAGE'

    startTimer()
    window.addEventListener('beforeunload', handleBeforeUnload)
  } catch (err) {
    loadError.value = err?.message || 'ไม่สามารถเข้าห้องสอบได้ กรุณาลองใหม่อีกครั้ง'
    if (err?.status === 409) loadErrorTitle.value = 'ข้อสอบชุดนี้ถูกส่งไปแล้ว'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await authStore.restore().catch(() => {})
  }
  await load()
})

onUnmounted(() => {
  stopTimer()
  if (saveTimer) clearTimeout(saveTimer)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave(() => {
  if (submitted.value || !submission.value) return true
  return window.confirm(
    'ออกจากห้องสอบตอนนี้? ระบบบันทึกคำตอบที่ทำไว้แล้ว — กลับเข้ามาทำต่อได้ก่อนหมดเวลา'
  )
})
</script>

<style scoped src="@/assets/styles/views/student-exam-taking.css"></style>
