<template>
  <StudentLayout>
    <div class="exam-list-view">
      <!-- 1. Hero / Banner -->
      <ExamBanner :student="studentProfile" :stats="stats" />

      <!-- 2. Search & Filter Bar -->
      <ExamFilter
        v-model="searchQuery"
        :active-filter="activeFilter"
        :options="filterOptions"
        @select-filter="handleFilterChange"
      />

      <!-- Action Notice Banner -->
      <div
        v-if="actionNotice.message"
        class="exam-action-notice"
        :style="actionNotice.type === 'info' ? 'background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;' : 'background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;'"
        role="status"
      >
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="material-symbols-outlined text-[20px]">
            {{ actionNotice.type === 'info' ? 'info' : 'error' }}
          </span>
          <span>{{ actionNotice.message }}</span>
        </div>
        <button
          type="button"
          style="background:none; border:none; cursor:pointer; color:inherit; font-weight:bold; font-size:14px;"
          @click="actionNotice.message = ''"
        >
          ✕
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="exam-status-box exam-status-box--loading">
        <div class="exam-spinner"></div>
        <p class="exam-status-text">กำลังโหลดรายการข้อสอบ...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="fetchError" class="exam-status-box exam-status-box--error">
        <div class="exam-status-icon">⚠️</div>
        <div class="exam-status-details">
          <h3 class="exam-status-title">ไม่สามารถโหลดรายการข้อสอบได้</h3>
          <p class="exam-status-desc">{{ fetchError }}</p>
        </div>
        <button type="button" class="exam-retry-btn" @click="fetchExams">
          ลองใหม่อีกครั้ง
        </button>
      </div>

      <!-- Content Sections -->
      <template v-else>
        <!-- Start error (เช่น สิทธิ์/IP/หมดเวลา) -->
        <AppStateNotice
          v-if="startError"
          variant="error"
          code="เข้าห้องสอบไม่สำเร็จ"
          :message="startError"
          compact
        >
          <button type="button" class="exam-notice-dismiss" @click="startError = ''">
            ปิดข้อความ
          </button>
        </AppStateNotice>

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
              :busy="startingExamId === exam.id"
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
      </template>

      <!-- 6. Exam Regulations & Guidelines Footer Banner -->
      <ExamGuidelines />

      <!-- 7. Result Review Modal (ผลคะแนนสอบจริงจาก API) -->
      <div
        v-if="showResultModal"
        class="exam-result-modal-overlay"
        style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px;"
        @click.self="showResultModal = false"
      >
        <div style="background: white; border-radius: 14px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0;">
              ผลคะแนนการสอบ
            </h3>
            <button
              type="button"
              style="background:none; border:none; cursor:pointer; font-size: 20px; color: #64748b;"
              @click="showResultModal = false"
            >
              ✕
            </button>
          </div>

          <div v-if="resultLoading" style="text-align: center; padding: 32px 0; color: #64748b;">
            <div class="exam-spinner" style="margin: 0 auto 12px;"></div>
            <p style="margin: 0; font-size: 14px;">กำลังโหลดผลคะแนนจากระบบ...</p>
          </div>

          <div v-else-if="resultError" style="margin-bottom: 16px;">
            <AppStateNotice
              variant="error"
              title="ไม่สามารถโหลดผลคะแนนได้"
              :message="resultError"
              compact
            />
          </div>

          <div v-else-if="examResult" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px;">
              <h4 style="margin: 0 0 6px; font-size: 16px; font-weight: 600; color: #0f172a;">
                {{ examResult.exam?.title || selectedExamTitle }}
              </h4>
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                สถานะ: <span style="font-weight: 600; color: #10b981;">ประกาศผลสอบเรียบร้อยแล้ว</span>
              </p>
            </div>

            <div style="display: flex; align-items: center; justify-content: center; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px;">
              <div style="text-align: center;">
                <div style="font-size: 13px; color: #047857; font-weight: 500; margin-bottom: 4px;">คะแนนที่ได้</div>
                <div style="font-size: 36px; font-weight: 800; color: #065f46; line-height: 1;">
                  {{ examResult.score ?? examResult.totalScore ?? '-' }}
                  <span style="font-size: 18px; font-weight: 500; color: #047857;">/ {{ examResult.exam?.totalsPoints ?? examResult.exam?.totalPoints ?? examResult.totalPoints ?? '-' }}</span>
                </div>
              </div>
            </div>

            <div v-if="examResult.feedback" style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px; font-size: 13px; color: #0369a1;">
              <strong>ข้อเสนอแนะจากผู้ตรวจ:</strong> {{ examResult.feedback }}
            </div>
          </div>

          <div style="margin-top: 24px; text-align: right;">
            <button
              type="button"
              style="background: #015b7e; color: white; border: none; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px;"
              @click="showResultModal = false"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  </StudentLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StudentLayout from '@/layouts/StudentLayout.vue'
import ExamBanner from '@/components/exam/ExamBanner.vue'
import ExamFilter from '@/components/exam/ExamFilter.vue'
import ExamCard from '@/components/exam/ExamCard.vue'
import ExamGuidelines from '@/components/exam/ExamGuidelines.vue'
import AppStateNotice from '@/components/common/AppStateNotice.vue'

import { studentExamService } from '@/services/studentExamService'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const fetchError = ref(null)
const rawExams = ref([])
const actionNotice = reactive({ message: '', type: 'info' })

// กำลังเริ่มทำข้อสอบชิ้นไหน + ข้อความ error ที่ได้จาก API (เช่น ไม่ได้อยู่ในห้อง/IP จำกัด)
const startingExamId = ref('')
const startError = ref('')

const searchQuery = ref('')
const activeFilter = ref('all')

const studentProfile = computed(() => {
  const u = authStore.user
  const name = u?.fullName || u?.name || 'นักเรียน'
  const studentCode = u?.studentCode ? `รหัส: ${u.studentCode}` : ''
  const greeting = (u?.fullName || u?.name)
    ? `สวัสดี ${u.fullName || u.name}${u.studentCode ? ` (${u.studentCode})` : ''}`
    : 'ยินดีต้อนรับสู่ระบบสอบออนไลน์'

  return {
    name,
    studentCode,
    fullNameWithClass: greeting,
    academicSession: 'ระบบพร้อมใช้งาน • ภาคเรียนปัจจุบัน'
  }
})

function calculateGrade(score, maxScore) {
  if (!maxScore || maxScore <= 0) return 'ผ่าน'
  const percent = (score / maxScore) * 100
  if (percent >= 80) return 'เกรด A'
  if (percent >= 70) return 'เกรด B'
  if (percent >= 60) return 'เกรด C'
  if (percent >= 50) return 'เกรด D'
  return 'เกรด F'
}

function formatDateThai(dateVal) {
  if (!dateVal) return ''
  try {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return String(dateVal)
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
  } catch {
    return String(dateVal)
  }
}

function formatDeadlineThai(dateVal, type) {
  if (!dateVal) {
    return type === 'open' ? 'กำหนดส่ง: ตามเวลาที่กำหนด' : 'กำหนดเปิด: เร็วๆ นี้'
  }
  try {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return String(dateVal)
    const datePart = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
    const timePart = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    return type === 'open'
      ? `กำหนดส่ง: ${datePart} เวลา ${timePart} น.`
      : `กำหนดเปิด: ${datePart} เวลา ${timePart} น.`
  } catch {
    return String(dateVal)
  }
}

function mapExamForCard(exam) {
  const sub = exam.mySubmission

  // 1. Determine type
  const isCompleted = Boolean(sub && ['SUBMITTED', 'GRADED', 'RELEASED'].includes(sub.status))
  const isOpen = !isCompleted && Boolean(exam.canStart || (exam.status === 'PUBLISHED' && (!sub || sub.status !== 'SUBMITTED')))
  const type = isCompleted ? 'completed' : (isOpen ? 'open' : 'upcoming')

  // Question count & total points
  const questionsCount =
    exam._count?.questions ??
    (Array.isArray(exam.questions) ? exam.questions.length : (exam.questionsCount ?? 0))

  const totalPoints =
    Number(exam.totalsPoints ?? exam.totalPoints) ||
    (Array.isArray(exam.questions)
      ? exam.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0)
      : (Number(exam.maxScore) || 0))

  const code = exam.code || exam.course?.code || exam.courseCode || 'EXAM'
  const subject = exam.subject || exam.course?.title || exam.course?.name || 'รายวิชาทั่วไป'
  const title = exam.title || 'ชุดข้อสอบ'
  const teacher =
    exam.teacher?.fullName ||
    exam.teacher?.name ||
    exam.teacherName ||
    exam.course?.teacher?.name ||
    'ครูผู้สอน'
  const department =
    exam.department ||
    exam.teacher?.department ||
    exam.course?.department ||
    'กลุ่มสาระการเรียนรู้'

  const rawDuration = exam.timeLimitMinutes ?? exam.durationMinutes ?? exam.duration
  const duration = rawDuration !== null && rawDuration !== undefined ? `${rawDuration} นาที` : 'ไม่จำกัดเวลา'
  const questions = `${questionsCount} ข้อ`

  let statusText = exam.statusText || ''
  if (!statusText) {
    if (type === 'completed') {
      if (sub?.status === 'RELEASED') statusText = 'ประกาศผลแล้ว'
      else if (sub?.status === 'GRADED') statusText = 'ตรวจเรียบร้อย'
      else if (sub?.status === 'SUBMITTED') statusText = 'ส่งแล้ว รอตรวจ'
      else statusText = 'สอบเสร็จแล้ว'
    } else if (type === 'open') {
      statusText = sub?.status === 'IN_PROGRESS' ? 'กำลังทำข้อสอบ' : 'เปิดให้ทำแล้ว'
    } else {
      statusText = 'ยังไม่ถึงเวลาสอบ'
    }
  }

  const score = sub?.totalScore ?? sub?.score ?? exam.score ?? 0
  const maxScoreNum = Number(totalPoints) || Number(exam.maxScore) || 0
  const grade = sub?.grade ?? exam.grade ?? calculateGrade(score, maxScoreNum)
  const submittedAt = sub?.submittedAt
    ? `ส่งเมื่อ ${formatDateThai(sub.submittedAt)}`
    : (exam.submittedAt ? `ส่งเมื่อ ${formatDateThai(exam.submittedAt)}` : '')
  const summaryText =
    exam.summaryText ||
    `ปรนัย ${questionsCount} ข้อ • เวลาที่กำหนด ${duration}`
  const evaluationText =
    exam.evaluationText ||
    (score >= maxScoreNum * 0.5 ? 'ผ่านเกณฑ์การประเมิน' : 'ไม่ผ่านเกณฑ์การประเมิน')

  const deadlineRaw = exam.deadline || exam.dueDate || exam.endTime || exam.availableUntil
  const startRaw = exam.startDate || exam.startTime || exam.availableFrom || exam.deadline
  const deadline = formatDeadlineThai(type === 'open' ? deadlineRaw : startRaw, type)

  let tagText = exam.tagText || ''
  let tagVariant = exam.tagVariant || 'neutral'
  let footerNote = exam.footerNote || ''
  let buttonText = exam.buttonText || ''

  if (type === 'open') {
    if (!tagText) {
      tagText = exam.isUrgent
        ? 'ใกล้หมดเวลา'
        : (questionsCount ? `ปรนัย ${questionsCount} ข้อ` : 'ข้อสอบออนไลน์')
      tagVariant = exam.isUrgent ? 'warning' : 'neutral'
    }
    if (!footerNote) {
      footerNote = sub?.status === 'IN_PROGRESS'
        ? 'ระบบบันทึกความคืบหน้าไว้แล้ว'
        : 'บันทึกคำตอบอัตโนมัติตลอดการสอบ'
    }
    if (!buttonText) {
      buttonText = sub?.status === 'IN_PROGRESS' ? 'ทำข้อสอบต่อ' : 'เข้าสู่ห้องสอบ'
    }
  } else if (type === 'upcoming') {
    if (!tagText) tagText = 'รอเปิดระบบ'
    if (!footerNote) footerNote = 'ปลดล็อคอัตโนมัติตามเวลา'
    if (!buttonText) buttonText = 'ยังไม่ถึงเวลาสอบ (ล็อค)'
  } else {
    if (!footerNote) footerNote = 'ดูข้อที่ตอบถูกและคำอธิบายเฉลย'
    if (!buttonText) buttonText = 'ดูผลคะแนนและเฉลย'
  }

  const maxScore = type === 'completed'
    ? maxScoreNum
    : (typeof totalPoints === 'number' ? `${totalPoints} คะแนน` : (totalPoints || '0 คะแนน'))

  return {
    id: exam.id,
    code,
    subject,
    type,
    statusText,
    title,
    teacher,
    department,
    duration,
    questions,
    maxScore,
    deadline,
    tagText,
    tagVariant,
    footerNote,
    buttonText,
    isUrgent: Boolean(exam.isUrgent),
    locked: type === 'upcoming' || Boolean(exam.locked),
    score,
    grade,
    submittedAt,
    summaryText,
    evaluationText,
    mySubmission: sub ?? null,
    submissionId: sub?.id ?? null,
    submissionStatus: sub?.status ?? null
  }
}

const mappedExams = computed(() => {
  return rawExams.value.map(mapExamForCard)
})

const stats = computed(() => {
  const all = mappedExams.value
  const openCount = all.filter((e) => e.type === 'open').length
  const upcomingCount = all.filter((e) => e.type === 'upcoming').length
  const completedCount = all.filter((e) => e.type === 'completed').length
  return {
    open: openCount,
    upcoming: upcomingCount,
    completed: completedCount
  }
})

const filterOptions = computed(() => [
  { id: 'all', label: 'ทั้งหมด', count: mappedExams.value.length },
  { id: 'open', label: 'เปิดสอบอยู่', count: stats.value.open },
  { id: 'upcoming', label: 'เร็วๆ นี้', count: stats.value.upcoming },
  { id: 'completed', label: 'สอบแล้ว', count: stats.value.completed }
])

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
    (exam.title && exam.title.toLowerCase().includes(query)) ||
    (exam.code && exam.code.toLowerCase().includes(query)) ||
    (exam.subject && exam.subject.toLowerCase().includes(query)) ||
    (exam.teacher && exam.teacher.toLowerCase().includes(query))
  )
}

const filteredOpenExams = computed(() => {
  return mappedExams.value.filter((e) => e.type === 'open' && matchesSearch(e))
})

const filteredUpcomingExams = computed(() => {
  return mappedExams.value.filter((e) => e.type === 'upcoming' && matchesSearch(e))
})

const filteredCompletedExams = computed(() => {
  return mappedExams.value.filter((e) => e.type === 'completed' && matchesSearch(e))
})

const fetchExams = async () => {
  loading.value = true
  fetchError.value = null
  try {
    const res = await studentExamService.listMyExams()
    const list = Array.isArray(res) ? res : (res?.exams ?? [])
    rawExams.value = list
  } catch (err) {
    console.error('Failed to load student exams:', err)
    fetchError.value =
      err?.response?.data?.message || err?.message || 'ไม่สามารถเชื่อมต่อระบบเพื่อโหลดข้อสอบได้'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await authStore.restore().catch(() => {})
  }
  await fetchExams()
})

/**
 * เข้าห้องสอบ: ตรวจสิทธิ์ด้วย API จริงก่อน (อ่านอย่างเดียว ไม่สร้างใบสอบ)
 * แล้วพาไปหน้าทำข้อสอบ — หน้าห้องสอบจะเป็นคนสร้าง/ทำต่อ submission เอง
 */
const handleStartExam = async (exam) => {
  if (!exam?.id || startingExamId.value) return

  startingExamId.value = exam.id
  startError.value = ''

  try {
    await studentExamService.getExamDetail(exam.id)
    router.push({ name: 'student-exam-take', params: { examId: exam.id } })
  } catch (err) {
    startError.value =
      err?.message || 'ไม่สามารถเข้าห้องสอบได้ กรุณาลองใหม่อีกครั้ง'
    // ข้อมูลอาจเปลี่ยนไปแล้ว (เช่น หมดเวลา/ถูกปิดสอบ) — โหลดรายการใหม่ให้ตรงสถานะ
    fetchExams()
  } finally {
    startingExamId.value = ''
  }
}

const showResultModal = ref(false)
const resultLoading = ref(false)
const resultError = ref('')
const examResult = ref(null)
const selectedExamTitle = ref('')

const handleReviewExam = async (cardExam) => {
  // ค้นหาข้อมูล submission จาก cardExam หรือค้นจาก rawExams ด้วย exam ID
  const rawExam = rawExams.value.find((e) => e.id === cardExam?.id)
  const sub = cardExam?.mySubmission || rawExam?.mySubmission
  const submissionId = sub?.id || cardExam?.submissionId
  const submissionStatus = sub?.status || cardExam?.submissionStatus

  if (!submissionId) {
    actionNotice.message = `ไม่พบข้อมูลการส่งข้อสอบของ "${cardExam?.title || 'ชุดข้อสอบนี้'}"`
    actionNotice.type = 'warning'
    return
  }

  if (submissionStatus !== 'RELEASED') {
    if (submissionStatus === 'SUBMITTED') {
      actionNotice.message = `ชุดข้อสอบ "${cardExam.title}" ส่งเรียบร้อยแล้ว อยู่ระหว่างรอคุณครูตรวจคะแนน`
    } else if (submissionStatus === 'GRADED') {
      actionNotice.message = `ชุดข้อสอบ "${cardExam.title}" ตรวจเรียบร้อยแล้ว อยู่ระหว่างรอคุณครูประกาศผลอย่างเป็นทางการ`
    } else {
      actionNotice.message = `ชุดข้อสอบ "${cardExam.title}" ยังไม่ได้ประกาศผลสอบอย่างเป็นทางการ กรุณารอคุณครูผู้สอนประกาศผล`
    }
    actionNotice.type = 'warning'
    return
  }

  selectedExamTitle.value = cardExam.title
  showResultModal.value = true
  resultLoading.value = true
  resultError.value = ''
  examResult.value = null

  try {
    const result = await studentExamService.getResult(submissionId)
    examResult.value = result
  } catch (err) {
    console.error('รายละเอียดข้อผิดพลาดเปิดดูผลคะแนน (Console Only):', err)
    resultError.value = err?.message || 'ไม่สามารถโหลดผลคะแนนได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    resultLoading.value = false
  }
}
</script>

<style scoped src="@/assets/styles/views/student-exam-list.css"></style>
