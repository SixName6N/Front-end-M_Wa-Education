<template>
  <TeacherLayout active-tab="exams">
    <div class="bank-view">
      <!-- TOP COMMAND & METRIC BAR -->
      <section class="bank-top-bar">
        <div class="bank-top-inner">
          <div>
            <div class="bank-breadcrumb">
              <span>พอร์ทัลอาจารย์</span>
              <span>/</span>
              <span class="bank-breadcrumb__current">คลังข้อสอบ</span>
            </div>
            <div class="bank-title-row">
              <h1 class="bank-title">คลังข้อสอบ</h1>
              <span class="bank-subtitle">ทั้งหมด {{ filteredExams.length }} ชุดข้อสอบใน 3 รายวิชา</span>
            </div>
          </div>

          <!-- Top CTA Buttons -->
          <div class="bank-top-actions">
            <button
              type="button"
              class="bank-btn bank-btn--secondary"
              @click="handleImportClick"
            >
              <span class="material-symbols-outlined text-[18px]">upload_file</span>
              <span>นำเข้า</span>
            </button>
            <button
              type="button"
              class="bank-btn bank-btn--primary"
              @click="openCreateModal"
            >
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span>สร้างชุดข้อสอบใหม่</span>
            </button>
          </div>
        </div>
      </section>

      <!-- COURSE SELECT TABS -->
      <div class="bank-course-tabs">
        <button
          v-for="c in courseTabs"
          :key="c.id"
          type="button"
          class="bank-tab-pill"
          :class="{ 'bank-tab-pill--active': selectedCourse === c.id }"
          @click="selectedCourse = c.id"
        >
          {{ c.label }}
        </button>
      </div>

      <!-- SEARCH & QUICK FILTERS -->
      <div class="bank-filter-bar">
        <!-- Search Input -->
        <div class="bank-search-wrap">
          <span class="material-symbols-outlined bank-search-icon">search</span>
          <input
            v-model="searchQuery"
            type="text"
            class="bank-search-input"
            placeholder="ค้นหาชุดข้อสอบ หรือหน่วยการเรียนรู้..."
          />
          <button
            v-if="searchQuery"
            type="button"
            class="bank-clear-btn"
            @click="searchQuery = ''"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <!-- Filter Dropdowns -->
        <div class="bank-dropdowns-row">
          <div class="bank-select-wrap">
            <select v-model="selectedStatus" class="bank-select">
              <option value="all">สถานะทั้งหมด</option>
              <option value="published">เผยแพร่แล้ว</option>
              <option value="active">กำลังเปิดสอบ</option>
              <option value="draft">ฉบับร่าง</option>
              <option value="review">รอตรวจทาน</option>
            </select>
            <span class="material-symbols-outlined bank-select-arrow">expand_more</span>
          </div>

          <div class="bank-select-wrap">
            <select v-model="sortBy" class="bank-select">
              <option value="updated">เรียง: แก้ไขล่าสุด</option>
              <option value="date">เรียง: วันที่จัดสอบ</option>
              <option value="score">เรียง: คะแนนรวม</option>
            </select>
            <span class="material-symbols-outlined bank-select-arrow">sort</span>
          </div>
        </div>
      </div>

      <!-- EXAM CARDS LIST -->
      <div class="bank-cards-stack">
        <article
          v-for="exam in filteredExams"
          :key="exam.id"
          class="bank-card"
        >
          <div class="bank-card-main">
            <!-- Badges line -->
            <div class="bank-card-badges">
              <span
                class="bank-status-pill"
                :class="`bank-status-pill--${exam.status}`"
              >
                <span class="bank-status-dot"></span>
                {{ exam.statusText }}
              </span>
              <span class="bank-badge-sub">{{ exam.courseCode }}</span>
              <span class="bank-badge-type">{{ exam.category }}</span>
            </div>

            <!-- Title -->
            <h2
              class="bank-card-title"
              @click="goToEdit(exam)"
            >
              {{ exam.title }}
            </h2>

            <!-- Meta details row -->
            <div class="bank-card-meta">
              <span>{{ exam.questionsCount }} ข้อ</span>
              <span class="bank-meta-dot">•</span>
              <span>{{ exam.maxScore }} คะแนน</span>
              <span class="bank-meta-dot">•</span>
              <span>เวลา {{ exam.duration }} นาที</span>
              <span class="bank-meta-dot">•</span>
              <span :class="exam.highlightClass">{{ exam.scheduleInfo }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="bank-card-actions">
            <!-- Edit button -->
            <button
              v-if="exam.status === 'active'"
              type="button"
              class="bank-btn bank-btn--monitoring"
              @click="handleMonitoring(exam)"
            >
              <span class="material-symbols-outlined text-[18px]">monitoring</span>
              <span>ดูผล & ตรวจ</span>
            </button>
            <button
              v-else-if="exam.status === 'review'"
              type="button"
              class="bank-btn bank-btn--review"
              @click="handleReview(exam)"
            >
              <span class="material-symbols-outlined text-[18px]">rule</span>
              <span>ตรวจสอบ</span>
            </button>
            <button
              v-else
              type="button"
              class="bank-btn bank-btn--edit"
              @click="goToEdit(exam)"
            >
              <span class="material-symbols-outlined text-[18px]">edit</span>
              <span>{{ exam.status === 'draft' ? 'แก้ไขต่อ' : 'แก้ไข' }}</span>
            </button>

            <!-- Delete button -->
            <button
              type="button"
              class="bank-del-btn"
              title="ลบชุดข้อสอบ"
              @click="triggerDelete(exam)"
            >
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </article>

        <!-- Empty state when no exam matches filter -->
        <div v-if="filteredExams.length === 0" class="bank-empty-state">
          <span class="material-symbols-outlined bank-empty-icon">search_off</span>
          <h3>ไม่พบชุดข้อสอบตามเงื่อนไขที่ระบุ</h3>
          <p>ลองค้นหาด้วยคำอื่น หรือเปลี่ยนตัวกรองสถานะ</p>
          <button
            type="button"
            class="bank-btn bank-btn--secondary"
            style="margin-top: 8px;"
            @click="resetFilters"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      </div>

      <!-- CREATE NEW EXAM MODAL -->
      <div v-if="showCreateModal" class="bank-modal-overlay" @click.self="showCreateModal = false">
        <div class="bank-modal-box">
          <div class="bank-modal-header">
            <div class="bank-modal-header-left">
              <div class="bank-modal-icon-badge">
                <span class="material-symbols-outlined text-[20px]">add</span>
              </div>
              <h4 class="bank-modal-title">สร้างชุดข้อสอบใหม่</h4>
            </div>
            <button type="button" class="bank-modal-close" @click="showCreateModal = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <form @submit.prevent="submitCreateExam" class="bank-modal-body">
            <div>
              <label class="bank-form-label">ชื่อชุดข้อสอบ</label>
              <input
                v-model="createForm.title"
                type="text"
                class="bank-form-input"
                placeholder="เช่น แบบทดสอบวัดผลปลายภาคเรียนที่ 1..."
                required
              />
            </div>

            <div class="bank-form-row">
              <div class="bank-form-col">
                <label class="bank-form-label">รายวิชา</label>
                <select v-model="createForm.course" class="bank-form-select">
                  <option value="ว23101 วิทยาศาสตร์ ม.3">ว23101 วิทยาศาสตร์ ม.3</option>
                  <option value="ว22101 วิทยาศาสตร์กายภาพ ม.2">ว22101 วิทยาศาสตร์กายภาพ ม.2</option>
                  <option value="ว30201 ฟิสิกส์เพิ่มเติม ม.4">ว30201 ฟิสิกส์เพิ่มเติม ม.4</option>
                </select>
              </div>
              <div class="bank-form-col">
                <label class="bank-form-label">ประเภทการสอบ</label>
                <select v-model="createForm.category" class="bank-form-select">
                  <option value="สอบเก็บคะแนนย่อย">สอบเก็บคะแนนย่อย</option>
                  <option value="สอบกลางภาค">สอบกลางภาค</option>
                  <option value="สอบปลายภาค">สอบปลายภาค</option>
                  <option value="แบบฝึกหัดท้ายหน่วย">แบบฝึกหัดท้ายหน่วย</option>
                </select>
              </div>
            </div>

            <div class="bank-form-row">
              <div class="bank-form-col">
                <label class="bank-form-label">เวลาในการทำ (นาที)</label>
                <input
                  v-model.number="createForm.duration"
                  type="number"
                  min="1"
                  class="bank-form-input"
                  required
                />
              </div>
              <div class="bank-form-col">
                <label class="bank-form-label">คะแนนรวม</label>
                <input
                  v-model.number="createForm.maxScore"
                  type="number"
                  min="1"
                  class="bank-form-input"
                  required
                />
              </div>
            </div>

            <div class="bank-modal-footer">
              <button
                type="button"
                class="bank-btn bank-btn--secondary"
                @click="showCreateModal = false"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                class="bank-btn bank-btn--primary"
              >
                สร้างและเริ่มใส่คำถาม
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- DELETE CONFIRMATION MODAL -->
      <div v-if="showDeleteModal" class="bank-modal-overlay" @click.self="showDeleteModal = false">
        <div class="bank-modal-box bank-modal-box--sm">
          <div class="bank-del-icon-circle">
            <span class="material-symbols-outlined text-[28px]">delete_forever</span>
          </div>
          <div>
            <h4 class="bank-modal-title">ยืนยันการลบชุดข้อสอบ?</h4>
            <p class="bank-modal-desc">
              คุณกำลังจะลบชุดข้อสอบ <strong>"{{ examToDelete?.title }}"</strong> ข้อมูลคะแนนและประวัติการสอบของผู้เรียนที่เกี่ยวข้องอาจถูกระงับชั่วคราว
            </p>
          </div>
          <div class="bank-modal-footer" style="padding-top: 8px;">
            <button
              type="button"
              class="bank-btn bank-btn--secondary"
              @click="showDeleteModal = false"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              class="bank-btn bank-btn--danger"
              @click="executeDelete"
            >
              ยืนยันการลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  </TeacherLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TeacherLayout from '@/layouts/TeacherLayout.vue'
import { examService } from '@/services/examService'

const router = useRouter()

// Filter states
const selectedCourse = ref('all')
const selectedStatus = ref('all')
const sortBy = ref('updated')
const searchQuery = ref('')

// Modal states
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const examToDelete = ref(null)

const createForm = reactive({
  title: '',
  course: 'ว23101 วิทยาศาสตร์ ม.3',
  category: 'สอบเก็บคะแนนย่อย',
  duration: 60,
  maxScore: 30
})

// Course filter tabs
const courseTabs = [
  { id: 'all', label: 'ทั้งหมด (14)' },
  { id: 'm3', label: 'ว23101 วิทย์ ม.3 (6)' },
  { id: 'm2', label: 'ว22101 กายภาพ ม.2 (4)' },
  { id: 'm4', label: 'ว30201 ฟิสิกส์ ม.4 (4)' }
]

// Exam data based on stitch design
const exams = ref([
  {
    id: 1,
    courseId: 'm3',
    courseCode: 'ว23101 ม.3',
    category: 'สอบกลางภาค',
    status: 'published',
    statusText: 'เผยแพร่แล้ว',
    title: 'แบบทดสอบวัดผลกลางภาค: วิทยาศาสตร์และเทคโนโลยี ม.3',
    questionsCount: '30 (ปรนัย 20, อัตนัย 10)',
    maxScore: 30,
    duration: 60,
    scheduleInfo: 'สอบ ศุกร์ 25 ก.ย. (15:30 - 16:30 น.)',
    highlightClass: 'bank-meta-highlight--secondary',
    updatedAt: 1727160000000
  },
  {
    id: 2,
    courseId: 'm3',
    courseCode: 'ว23101 ม.3/2',
    category: 'เก็บคะแนนย่อย',
    status: 'active',
    statusText: 'กำลังเปิดสอบ',
    title: 'แบบทดสอบย่อยบทที่ 2: พันธุศาสตร์และการถ่ายทอดลักษณะทางพันธุกรรม',
    questionsCount: '15',
    maxScore: 15,
    duration: 40,
    scheduleInfo: 'ส่งแล้ว 32/35 คน (91%)',
    highlightClass: 'bank-meta-highlight--primary',
    updatedAt: 1727150000000
  },
  {
    id: 3,
    courseId: 'm2',
    courseCode: 'ว22101 ม.2',
    category: 'แบบฝึกหัดท้ายหน่วย',
    status: 'draft',
    statusText: 'ฉบับร่าง',
    title: 'แบบทดสอบท้ายหน่วยที่ 1: เซลล์และการลำเลียงสารผ่านเยื่อหุ้มเซลล์',
    questionsCount: '10',
    maxScore: 10,
    duration: 30,
    scheduleInfo: 'แก้ไขล่าสุด เมื่อวานนี้ 14:20 น.',
    highlightClass: 'bank-meta-highlight--muted',
    updatedAt: 1727140000000
  },
  {
    id: 4,
    courseId: 'm4',
    courseCode: 'ว30201 ม.4',
    category: 'ปลายภาคเรียนที่ 2',
    status: 'review',
    statusText: 'รอตรวจทาน',
    title: 'แบบทดสอบปลายภาคเรียนที่ 2 (ร่างคลังข้อสอบร่วม OBEC ภาคเหนือ)',
    questionsCount: '40',
    maxScore: 40,
    duration: 90,
    scheduleInfo: 'รอการอนุมัติโดยหัวหน้ากลุ่มสาระฯ',
    highlightClass: 'bank-meta-highlight--amber',
    updatedAt: 1727130000000
  }
])

// Filter & Sort logic
const filteredExams = computed(() => {
  return exams.value
    .filter((e) => {
      // Course filter
      if (selectedCourse.value !== 'all' && e.courseId !== selectedCourse.value) {
        return false
      }
      // Status filter
      if (selectedStatus.value !== 'all' && e.status !== selectedStatus.value) {
        return false
      }
      // Search query
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim()
        const matchesTitle = e.title.toLowerCase().includes(q)
        const matchesCode = e.courseCode.toLowerCase().includes(q)
        const matchesCat = e.category.toLowerCase().includes(q)
        return matchesTitle || matchesCode || matchesCat
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy.value === 'score') return b.maxScore - a.maxScore
      if (sortBy.value === 'date') return b.duration - a.duration
      return b.updatedAt - a.updatedAt
    })
})

const loading = ref(false)

const fetchExams = async () => {
  loading.value = true
  try {
    const list = await examService.listExams()
    if (list && list.length > 0) {
      exams.value = list.map((item) => ({
        id: item.id,
        courseId: item.courseId || 'm3',
        courseCode: item.course?.code || item.courseCode || 'ว23101 ม.3',
        category: item.category || 'สอบวัดผล',
        status: item.status === 'PUBLISHED' ? 'published' : item.status === 'CLOSED' ? 'review' : 'draft',
        statusText: item.status === 'PUBLISHED' ? 'เผยแพร่แล้ว' : item.status === 'CLOSED' ? 'รอตรวจทาน' : 'ฉบับร่าง',
        title: item.title,
        questionsCount: item._count?.questions ?? item.questions?.length ?? 10,
        maxScore: item.maxScore || 30,
        duration: item.timeLimitMinutes || 60,
        scheduleInfo: item.updatedAt ? `แก้ไขล่าสุด ${new Date(item.updatedAt).toLocaleDateString('th-TH')}` : 'พร้อมใช้งาน',
        highlightClass: item.status === 'PUBLISHED' ? 'bank-meta-highlight--secondary' : 'bank-meta-highlight--primary',
        updatedAt: item.updatedAt ? new Date(item.updatedAt).getTime() : Date.now()
      }))
    }
  } catch (err) {
    // Graceful fallback to mock data when backend is not responding or during offline development
    console.warn('Backend API connection note:', err.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchExams()
})

const resetFilters = () => {
  selectedCourse.value = 'all'
  selectedStatus.value = 'all'
  searchQuery.value = ''
  sortBy.value = 'updated'
}

// Navigation actions
const goToEdit = (exam) => {
  router.push({
    path: '/teacher/exams/create',
    query: { id: exam.id, title: exam.title }
  })
}

const handleMonitoring = (exam) => {
  alert(`กำลังเปิดหน้าจอตรวจข้อสอบ & ติดตามผลสด: ${exam.title}`)
}

const handleReview = (exam) => {
  alert(`กำลังเปิดหน้าจอตรวจสอบเกณฑ์ข้อสอบ: ${exam.title}`)
}

const handleImportClick = () => {
  alert('เปิดหน้าต่างนำเข้าชุดข้อสอบ (รองรับไฟล์ Word .docx, Excel .xlsx, CSV)')
}

// Create modal
const openCreateModal = () => {
  createForm.title = ''
  createForm.duration = 60
  createForm.maxScore = 30
  showCreateModal.value = true
}

const submitCreateExam = async () => {
  showCreateModal.value = false
  let createdId = null
  try {
    const res = await examService.createExam({
      title: createForm.title,
      timeLimitMinutes: createForm.duration
    })
    if (res?.id) createdId = res.id
  } catch (err) {
    console.warn('Backend API note:', err.message)
  }

  // Navigate to builder
  router.push({
    path: '/teacher/exams/create',
    query: {
      id: createdId || undefined,
      title: createForm.title,
      course: createForm.course,
      duration: createForm.duration,
      score: createForm.maxScore
    }
  })
}

// Delete actions
const triggerDelete = (exam) => {
  examToDelete.value = exam
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (examToDelete.value) {
    const targetId = examToDelete.value.id
    try {
      if (typeof targetId === 'string' && targetId.length > 10) {
        await examService.deleteExam(targetId, { force: true })
      }
    } catch (err) {
      console.warn('Backend API delete note:', err.message)
    }

    const idx = exams.value.findIndex((e) => e.id === targetId)
    if (idx !== -1) {
      exams.value.splice(idx, 1)
    }
  }
  showDeleteModal.value = false
  examToDelete.value = null
}
</script>

<style scoped>
/* ==========================================================================
   TEACHER EXAM BANK VIEW - ACADEMIC CLARITY DESIGN
   Matches DESIGN.md and stitch_online_exam_assessment_system (3)
   ========================================================================== */

.bank-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  font-family: 'Prompt', 'Inter', sans-serif;
  color: #1a1c1c;
}

/* Material Symbols helper */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  vertical-align: middle;
}

/* Top Command & Metric Bar */
.bank-top-bar {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.bank-top-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (min-width: 640px) {
  .bank-top-inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.bank-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}

.bank-breadcrumb__current {
  color: #015b7e;
  font-weight: 600;
}

.bank-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px;
}

.bank-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

.bank-subtitle {
  font-size: 13px;
  color: #6b7280;
}

.bank-top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Buttons */
.bank-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.bank-btn--primary {
  background-color: #015b7e;
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(1, 91, 126, 0.2);
}

.bank-btn--primary:hover {
  background-color: #0d8aaa;
  box-shadow: 0 4px 10px rgba(1, 91, 126, 0.3);
}

.bank-btn--secondary {
  background-color: #f3f4f6;
  color: #374151;
  border-color: #e5e7eb;
}

.bank-btn--secondary:hover {
  background-color: #e5e7eb;
  color: #111827;
}

.bank-btn--edit {
  background-color: #f3f4f6;
  color: #015b7e;
  font-size: 13px;
  padding: 6px 14px;
}

.bank-btn--edit:hover {
  background-color: #e0f2fe;
}

.bank-btn--monitoring {
  background-color: #006780;
  color: #ffffff;
  font-size: 13px;
  padding: 6px 14px;
  box-shadow: 0 1px 2px rgba(0, 103, 128, 0.2);
}

.bank-btn--monitoring:hover {
  background-color: #004d61;
}

.bank-btn--review {
  background-color: #ffedd5;
  color: #9a3412;
  font-size: 13px;
  padding: 6px 14px;
}

.bank-btn--review:hover {
  background-color: #fed7aa;
}

.bank-btn--danger {
  background-color: #ba1a1a;
  color: #ffffff;
}

.bank-btn--danger:hover {
  background-color: #93000a;
}

.bank-del-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.bank-del-btn:hover {
  background-color: #fee2e2;
  color: #ba1a1a;
}

/* Course Tabs */
.bank-course-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.bank-tab-pill {
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  background-color: #f3f4f6;
  border: 1px solid transparent;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.bank-tab-pill:hover {
  background-color: #e5e7eb;
  color: #111827;
}

.bank-tab-pill--active {
  background-color: #015b7e;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(1, 91, 126, 0.2);
}

/* Search & Quick Filters */
.bank-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (min-width: 640px) {
  .bank-filter-bar {
    flex-direction: row;
    align-items: center;
  }
}

.bank-search-wrap {
  position: relative;
  flex: 1;
  width: 100%;
}

.bank-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 18px;
  pointer-events: none;
}

.bank-search-input {
  width: 100%;
  padding: 9px 36px 9px 38px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.15s ease;
}

.bank-search-input:focus {
  border-color: #015b7e;
  box-shadow: 0 0 0 2px rgba(1, 91, 126, 0.15);
}

.bank-clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
}

.bank-clear-btn:hover {
  color: #111827;
}

.bank-dropdowns-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

@media (min-width: 640px) {
  .bank-dropdowns-row {
    width: auto;
  }
}

.bank-select-wrap {
  position: relative;
  flex: 1;
  min-width: 130px;
}

@media (min-width: 640px) {
  .bank-select-wrap {
    flex: none;
  }
}

.bank-select {
  width: 100%;
  appearance: none;
  padding: 9px 30px 9px 12px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.15s ease;
}

.bank-select:focus {
  border-color: #015b7e;
  box-shadow: 0 0 0 2px rgba(1, 91, 126, 0.15);
}

.bank-select-arrow {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 18px;
  pointer-events: none;
}

/* Exam Cards Stack */
.bank-cards-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bank-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.15s ease;
}

@media (min-width: 768px) {
  .bank-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.bank-card:hover {
  box-shadow: 0 4px 12px rgba(1, 91, 126, 0.07);
}

.bank-card-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bank-card-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* Status Pills */
.bank-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

.bank-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.bank-status-pill--published {
  background-color: #e2f2e9;
  color: #156634;
}

.bank-status-pill--published .bank-status-dot {
  background-color: #156634;
}

.bank-status-pill--active {
  background-color: #b8eaff;
  color: #004d61;
}

.bank-status-pill--active .bank-status-dot {
  background-color: #006780;
}

.bank-status-pill--draft {
  background-color: #e2e2e2;
  color: #40484e;
}

.bank-status-pill--draft .bank-status-dot {
  background-color: #70787e;
}

.bank-status-pill--review {
  background-color: #ffddb4;
  color: #633f00;
}

.bank-status-pill--review .bank-status-dot {
  background-color: #764c00;
}

.bank-badge-sub {
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.bank-badge-type {
  font-size: 12px;
  color: #6b7280;
}

.bank-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  cursor: pointer;
  transition: color 0.15s ease;
  line-height: 1.4;
}

.bank-card-title:hover {
  color: #015b7e;
}

.bank-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.bank-meta-dot {
  color: #d1d5db;
}

.bank-meta-highlight--primary {
  color: #015b7e;
  font-weight: 600;
}

.bank-meta-highlight--secondary {
  color: #006780;
  font-weight: 600;
}

.bank-meta-highlight--amber {
  color: #b45309;
  font-weight: 500;
}

.bank-meta-highlight--muted {
  color: #6b7280;
}

.bank-card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  align-self: flex-end;
}

@media (min-width: 768px) {
  .bank-card-actions {
    align-self: center;
  }
}

/* Empty State */
.bank-empty-state {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 40px 20px;
  border: 1px dashed #cbd5e1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.bank-empty-icon {
  font-size: 40px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.bank-empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.bank-empty-state p {
  font-size: 13px;
}

/* Modal Styles */
.bank-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.bank-modal-box {
  background-color: #ffffff;
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bank-modal-box--sm {
  max-width: 440px;
}

.bank-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bank-modal-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bank-modal-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #015b7e;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bank-modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.bank-modal-close {
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
}

.bank-modal-close:hover {
  color: #111827;
}

.bank-modal-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bank-form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.bank-form-input,
.bank-form-select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  font-size: 14px;
  color: #111827;
  outline: none;
  font-family: inherit;
  transition: all 0.15s ease;
}

.bank-form-input:focus,
.bank-form-select:focus {
  background-color: #ffffff;
  border-color: #015b7e;
  box-shadow: 0 0 0 2px rgba(1, 91, 126, 0.15);
}

.bank-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.bank-form-col {
  display: flex;
  flex-direction: column;
}

.bank-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

/* Delete Modal Specifics */
.bank-del-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #fee2e2;
  color: #ba1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bank-modal-desc {
  font-size: 13px;
  color: #4b5563;
  margin-top: 6px;
  line-height: 1.5;
}
</style>
