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
              <span class="bank-subtitle">ทั้งหมด {{ filteredExams.length }} ชุดข้อสอบ{{ courseTabs.length > 1 ? ` ใน ${courseTabs.length - 1} รายวิชา` : '' }}</span>
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
              <option value="draft">ฉบับร่าง</option>
              <option value="closed">ปิดแล้ว</option>
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
                :class="`bank-status-pill--${exam.status || 'draft'}`"
              >
                <span class="bank-status-dot"></span>
                {{ exam.statusText || 'ฉบับร่าง' }}
              </span>
              <span v-if="exam.courseCode" class="bank-badge-sub">{{ exam.courseCode }}</span>
              <span v-if="exam.category || exam.courseCode" class="bank-badge-type">{{ exam.category || exam.courseCode }}</span>
            </div>

            <!-- Title -->
            <h2
              class="bank-card-title"
              @click="goToEdit(exam)"
            >
              {{ exam.title || 'ไม่มีชื่อชุดข้อสอบ' }}
            </h2>

            <!-- Meta details row -->
            <div class="bank-card-meta">
              <span>{{ exam.questionsCount ?? 0 }} ข้อ</span>
              <span class="bank-meta-dot">•</span>
              <span>{{ exam.totalPoints ?? exam.maxScore ?? 0 }} คะแนน</span>
              <span class="bank-meta-dot">•</span>
              <span>เวลา {{ exam.duration || 60 }} นาที</span>
              <span v-if="exam.scheduleInfo" class="bank-meta-dot">•</span>
              <span v-if="exam.scheduleInfo" :class="exam.highlightClass">{{ exam.scheduleInfo }}</span>
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

        <!-- Error state -->
        <div v-if="fetchError" class="bank-error-state">
          <span class="material-symbols-outlined bank-empty-icon" style="color: #ef4444;">error</span>
          <h3>เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
          <p>{{ fetchError }}</p>
          <button
            type="button"
            class="bank-btn bank-btn--secondary"
            style="margin-top: 8px;"
            @click="fetchExams"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>

        <!-- Loading state -->
        <div v-else-if="loading" class="bank-empty-state">
          <span class="material-symbols-outlined bank-empty-icon">sync</span>
          <h3>กำลังโหลดชุดข้อสอบ...</h3>
        </div>

        <!-- Empty state when no exam matches filter -->
        <div v-else-if="filteredExams.length === 0" class="bank-empty-state">
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
                <select v-model="createForm.courseId" class="bank-form-select">
                  <option :value="null">ไม่ระบุรายวิชา (ทั่วไป)</option>
                  <option v-for="c in courses" :key="c.id" :value="c.id">
                    {{ c.code ? `${c.code} ${c.title || c.name || ''}`.trim() : (c.title || c.name || c.id) }}
                  </option>
                </select>
              </div>
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
              คุณกำลังจะลบชุดข้อสอบ <strong>"{{ examToDelete?.title || 'ชุดข้อสอบ' }}"</strong> ข้อมูลคะแนนและประวัติการสอบของผู้เรียนที่เกี่ยวข้องอาจถูกระงับชั่วคราว
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
import { mapApiExamToView } from '@/utils/examMappers'

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
  courseId: null,
  duration: 60
})

// Courses list
const courses = ref([])

// Course filter tabs
const courseTabs = ref([
  { id: 'all', label: 'ทั้งหมด' }
])

// Exam data — loaded from API only
const exams = ref([])
const loading = ref(false)
const fetchError = ref('')

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
        const matchesTitle = (e.title || '').toLowerCase().includes(q)
        const matchesCode = (e.courseCode || '').toLowerCase().includes(q)
        const matchesDesc = (e.description || '').toLowerCase().includes(q)
        const matchesCat = (e.category || '').toLowerCase().includes(q)
        return matchesTitle || matchesCode || matchesDesc || matchesCat
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy.value === 'score') return (b.totalPoints ?? b.maxScore ?? 0) - (a.totalPoints ?? a.maxScore ?? 0)
      if (sortBy.value === 'date') return (b.duration || 0) - (a.duration || 0)
      return (b.updatedAt || 0) - (a.updatedAt || 0)
    })
})

const fetchCourses = async () => {
  try {
    const list = await examService.listCourses()
    if (Array.isArray(list) && list.length > 0) {
      courses.value = list
    }
  } catch (err) {
    console.warn('fetchCourses error:', err)
  }
}

const fetchExams = async () => {
  loading.value = true
  fetchError.value = ''
  try {
    const [list, courseList] = await Promise.all([
      examService.listExams(),
      examService.listCourses().catch((err) => {
        console.warn('listCourses error:', err)
        return []
      })
    ])
    exams.value = (list || []).map(mapApiExamToView)
    if (Array.isArray(courseList) && courseList.length > 0) {
      courses.value = courseList
    }

    // สร้างแท็บรายวิชาจากข้อมูลจริง
    const courseMap = new Map()
    for (const e of exams.value) {
      if (e.courseId && !courseMap.has(e.courseId)) {
        courseMap.set(e.courseId, e.courseCode || e.category || e.courseId)
      }
    }

    if (courses.value.length === 0 && courseMap.size > 0) {
      courses.value = Array.from(courseMap.entries()).map(([id, label]) => ({
        id,
        code: label,
        title: label
      }))
    }

    courseTabs.value = [
      { id: 'all', label: `ทั้งหมด (${exams.value.length})` },
      ...Array.from(courseMap.entries()).map(([id, code]) => {
        const count = exams.value.filter((e) => e.courseId === id).length
        return { id, label: `${code} (${count})` }
      })
    ]
  } catch (err) {
    fetchError.value = `ไม่สามารถโหลดข้อมูลชุดข้อสอบได้: ${err.message}`
    console.error('fetchExams error:', err)
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
    query: {
      id: exam.id,
      title: exam.title || '',
      ...(exam.courseCode ? { course: exam.courseCode } : {}),
      duration: exam.duration || 60
    }
  })
}

const handleMonitoring = () => {
  router.push('/teacher/grading')
}

const handleReview = (exam) => {
  if (exam?.id) {
    goToEdit(exam)
  }
}

const handleImportClick = () => {
  alert('เปิดหน้าต่างนำเข้าชุดข้อสอบ (รองรับไฟล์ Word .docx, Excel .xlsx, CSV)')
}

// Create modal
const openCreateModal = async () => {
  createForm.title = ''
  createForm.duration = 60

  if (courses.value.length === 0) {
    await fetchCourses()
  }

  createForm.courseId = selectedCourse.value !== 'all' ? selectedCourse.value : (courses.value[0]?.id || null)
  showCreateModal.value = true
}

const submitCreateExam = async () => {
  let createdId = null
  try {
    const payload = {
      title: createForm.title.trim(),
      timeLimitMinutes: Number(createForm.duration) || 60
    }
    if (createForm.courseId) payload.courseId = createForm.courseId

    const res = await examService.createExam(payload)
    if (res?.id) createdId = res.id
    showCreateModal.value = false

    const selectedCourseObj = courses.value.find((c) => c.id === createForm.courseId)
    router.push({
      path: '/teacher/exams/create',
      query: {
        id: createdId || undefined,
        title: createForm.title.trim(),
        ...(selectedCourseObj ? { course: selectedCourseObj.code || selectedCourseObj.title } : {}),
        duration: createForm.duration
      }
    })
  } catch (err) {
    alert(`ไม่สามารถสร้างชุดข้อสอบได้: ${err.message}`)
  }
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
      const idx = exams.value.findIndex((e) => e.id === targetId)
      if (idx !== -1) {
        exams.value.splice(idx, 1)
      }
    } catch (err) {
      alert(`ไม่สามารถลบชุดข้อสอบได้: ${err.message}`)
    }
  }
  showDeleteModal.value = false
  examToDelete.value = null
}
</script>

<style scoped src="@/assets/styles/views/teacher-exam-bank.css"></style>
