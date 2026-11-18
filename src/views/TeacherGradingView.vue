<template>
  <TeacherLayout active-tab="grading">
    <div class="grading-view">
      <!-- Header Section & Quick Stats -->
      <section class="grading-header">
        <div>
          <nav aria-label="Breadcrumb" class="grading-breadcrumb">
            <span>หน้าหลัก</span>
            <span class="grading-breadcrumb__sep">/</span>
            <span class="grading-breadcrumb__current">ตรวจข้อสอบ</span>
          </nav>
          <h1 class="grading-title">ตรวจข้อสอบ</h1>
          <p class="grading-subtitle">เลือกชุดข้อสอบที่คุณต้องการตรวจหรือดูสรุปคะแนน</p>
        </div>

        <!-- Quick Stats Box -->
        <div class="grading-stats-card">
          <!-- Stat 1: Pending Review -->
          <div class="grading-stat-item">
            <div class="grading-stat-icon grading-stat-icon--amber">
              <ClipboardList :size="20" />
            </div>
            <div class="grading-stat-info">
              <span class="grading-stat-label">ข้อสอบที่รอตรวจ</span>
              <span class="grading-stat-value grading-stat-value--amber">{{ pendingExams.length }} ชุด</span>
            </div>
          </div>

          <div class="grading-stat-divider"></div>

          <!-- Stat 2: Completed -->
          <div class="grading-stat-item">
            <div class="grading-stat-icon grading-stat-icon--emerald">
              <CheckCircle2 :size="20" />
            </div>
            <div class="grading-stat-info">
              <span class="grading-stat-label">ตรวจเสร็จสมบูรณ์แล้ว</span>
              <span class="grading-stat-value grading-stat-value--emerald">{{ completedExams.length }} ชุด</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Action Tabs & Search Bar -->
      <div class="grading-filter-bar">
        <!-- Tabs -->
        <div class="grading-tabs-scroll">
          <button
            type="button"
            class="grading-tab-btn"
            :class="{ 'grading-tab-btn--active': activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            <BookOpen :size="16" />
            <span>ทั้งหมด</span>
            <span class="grading-tab-badge">{{ pendingExams.length + completedExams.length }} ชุด</span>
          </button>

          <button
            type="button"
            class="grading-tab-btn"
            :class="{ 'grading-tab-btn--active': activeTab === 'pending' }"
            @click="activeTab = 'pending'"
          >
            <ClipboardList :size="16" />
            <span>งานที่ต้องตรวจ</span>
            <span class="grading-tab-badge">{{ pendingExams.length }} ชุด</span>
          </button>

          <button
            type="button"
            class="grading-tab-btn"
            :class="{ 'grading-tab-btn--active': activeTab === 'completed' }"
            @click="activeTab = 'completed'"
          >
            <CheckCircle2 :size="16" />
            <span>ตรวจเสร็จแล้ว / ดูผลคะแนน</span>
            <span class="grading-tab-badge">{{ completedExams.length }} ชุด</span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="grading-search-wrap">
          <Search class="grading-search-icon" :size="18" />
          <input
            v-model="searchQuery"
            type="text"
            class="grading-search-input"
            placeholder="ค้นหาชื่อชุดข้อสอบหรือวิชา..."
          />
          <button
            v-if="searchQuery"
            type="button"
            class="grading-search-clear"
            @click="searchQuery = ''"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

      <!-- SECTION 1: Pending Grading (Action Required) -->
      <section
        v-if="shouldShowPendingSection"
        class="grading-section"
      >
        <div class="grading-section-header">
          <div class="grading-section-title-wrap">
            <span class="grading-dot grading-dot--amber"></span>
            <h2 class="grading-section-title">ชุดข้อสอบที่รออาจารย์ตรวจให้คะแนน</h2>
          </div>
          <span class="grading-section-hint">มีข้อสอบอัตนัยที่ต้องการคะแนนจากผู้สอน</span>
        </div>

        <!-- Pending Cards List -->
        <article
          v-for="exam in filteredPendingExams"
          :key="exam.id"
          class="grading-pending-card"
        >
          <div class="grading-pending-accent-bar"></div>

          <div class="grading-pending-body">
            <!-- Badges line -->
            <div class="grading-badges-row">
              <span class="grading-badge-course">
                <GraduationCap :size="14" />
                <span>{{ exam.courseCode }} • {{ exam.category }}</span>
              </span>
              <span class="grading-badge-alert">
                <span class="grading-pulse-dot"></span>
                <span>มีข้อเขียนรอตรวจ</span>
              </span>
            </div>

            <!-- Title & Meta -->
            <div>
              <h3 class="grading-card-title">{{ exam.title }}</h3>
              <p class="grading-card-meta">
                <span>นักเรียนส่งข้อสอบแล้ว {{ exam.submittedCount }} จาก {{ exam.totalStudents }} คน</span>
                <span class="text-gray-300">•</span>
                <span class="grading-meta-tag">รอตรวจ {{ exam.pendingCount }} คน</span>
              </p>
            </div>

            <!-- Auto-grading Progress Bar -->
            <div class="grading-progress-row">
              <div class="grading-progress-track">
                <div
                  class="grading-progress-bar"
                  :style="{ width: `${exam.autoGradedPercent}%` }"
                ></div>
              </div>
              <span class="grading-progress-label">
                <Check :size="14" />
                <span>ตรวจปรนัยเสร็จแล้ว {{ exam.autoGradedPercent }}% (ระบบตรวจให้อัตโนมัติ)</span>
              </span>
            </div>
          </div>

          <!-- Start Grading CTA Button -->
          <div>
            <button
              type="button"
              class="grading-cta-btn"
              @click="startGrading(exam)"
            >
              <span>เริ่มตรวจและให้คะแนนนักเรียน</span>
              <ArrowRight :size="18" />
            </button>
          </div>
        </article>
      </section>

      <!-- SECTION 2: Completed / View Scores -->
      <section
        v-if="shouldShowCompletedSection"
        class="grading-section"
      >
        <div class="grading-section-header">
          <div class="grading-section-title-wrap">
            <span class="grading-dot grading-dot--emerald"></span>
            <h2 class="grading-section-title">ชุดข้อสอบที่ตรวจเสร็จแล้ว (ดูคะแนนได้ทันที)</h2>
          </div>
          <span class="grading-section-hint">คะแนนสรุปพร้อมให้นักเรียนและจัดทำรายงาน</span>
        </div>

        <!-- Completed Cards Stack -->
        <div class="grading-completed-list">
          <article
            v-for="exam in filteredCompletedExams"
            :key="exam.id"
            class="grading-completed-card"
          >
            <div class="grading-completed-body">
              <div class="grading-badges-row">
                <span class="grading-badge-gray">{{ exam.courseCode }}</span>
                <span class="grading-badge-green">
                  <CheckCircle2 :size="14" />
                  <span>ตรวจครบ 100%</span>
                </span>
                <span class="text-xs text-gray-500">{{ exam.classroomInfo }}</span>
              </div>

              <div>
                <h3 class="grading-completed-title">{{ exam.title }}</h3>
                <p class="grading-completed-desc">
                  {{ exam.summaryText }}
                </p>
              </div>
            </div>

            <!-- View Score Button -->
            <div>
              <button
                type="button"
                class="grading-view-scores-btn"
                @click="viewExamScores(exam)"
              >
                <Eye :size="16" />
                <span>ดูคะแนนนักเรียน</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- Empty State if No Results Found -->
      <div v-if="noResultsFound" class="grading-empty-state">
        <div class="grading-empty-icon">
          <SearchX :size="24" />
        </div>
        <h3 class="grading-empty-title">ไม่พบชุดข้อสอบที่ค้นหา</h3>
        <p class="grading-empty-desc">ลองค้นหาด้วยชื่อชุดข้อสอบ รหัสวิชา หรือเปลี่ยนแท็บตัวกรอง</p>
        <button
          type="button"
          class="grading-empty-btn"
          @click="resetSearch"
        >
          ล้างคำค้นหา
        </button>
      </div>

      <!-- Footer Help & Info Note -->
      <footer class="grading-helper-footer">
        <div class="grading-helper-left">
          <Info :size="16" class="text-[#015b7e]" />
          <span>ข้อสอบปรนัยจะตรวจให้อัตโนมัติ ส่วนข้อสอบอัตนัยคุณครูสามารถคลิกตรวจทีละคนได้อย่างสะดวก</span>
        </div>
        <div class="grading-helper-right">
          <a href="#" class="grading-helper-link" @click.prevent="openGuideModal">
            <BookOpen :size="14" />
            <span>คู่มือการตรวจข้อสอบ</span>
          </a>
          <span>•</span>
          <a href="#" class="grading-helper-link" @click.prevent="openHelpModal">
            <HelpCircle :size="14" />
            <span>สอบถามความช่วยเหลือ</span>
          </a>
        </div>
      </footer>

      <!-- Score Summary Modal -->
      <div
        v-if="selectedExamForScores"
        class="grading-modal-overlay"
        @click.self="selectedExamForScores = null"
      >
        <div class="grading-modal-card">
          <div class="grading-modal-header">
            <div>
              <span class="text-xs font-semibold text-[#015b7e]">{{ selectedExamForScores.courseCode }}</span>
              <h4 class="grading-modal-title">{{ selectedExamForScores.title }}</h4>
            </div>
            <button
              type="button"
              class="grading-modal-close"
              @click="selectedExamForScores = null"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="grading-modal-body">
            <div class="grading-modal-stat-grid">
              <div class="grading-modal-stat-box">
                <span class="grading-modal-stat-label">จำนวนผู้ส่งข้อสอบ</span>
                <div class="grading-modal-stat-val">{{ selectedExamForScores.totalStudents || 35 }} คน</div>
              </div>
              <div class="grading-modal-stat-box">
                <span class="grading-modal-stat-label">คะแนนเฉลี่ย</span>
                <div class="grading-modal-stat-val text-emerald-600">{{ selectedExamForScores.avgScore || '8.42' }} คะแนน</div>
              </div>
            </div>
            <p class="text-sm text-gray-600">
              สถานะ: ตรวจคำตอบครบถ้วนเรียบร้อยแล้ว ข้อมูลคะแนนถูกบันทึกลงสู่สมุดเกรดและส่งผลสอบให้นักเรียนแล้ว
            </p>
          </div>

          <div class="grading-modal-footer">
            <button
              type="button"
              class="grading-view-scores-btn"
              @click="selectedExamForScores = null"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  </TeacherLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TeacherLayout from '@/layouts/TeacherLayout.vue'
import {
  ClipboardList,
  CheckCircle2,
  BookOpen,
  Search,
  SearchX,
  X,
  GraduationCap,
  Check,
  ArrowRight,
  Eye,
  Info,
  HelpCircle
} from 'lucide-vue-next'
import { examService } from '@/services/examService'

const router = useRouter()

// Filter states
const activeTab = ref('all') // 'all' | 'pending' | 'completed'
const searchQuery = ref('')
const selectedExamForScores = ref(null)

// Data state
const pendingExams = ref([
  {
    id: 'p-1',
    courseCode: 'ว23101 วิทยาศาสตร์ ม.3',
    category: 'สอบกลางภาค',
    title: 'แบบทดสอบวัดผลกลางภาค: วิทยาศาสตร์และเทคโนโลยี',
    submittedCount: 32,
    totalStudents: 35,
    pendingCount: 3,
    autoGradedPercent: 100,
    hasEssay: true
  }
])

const completedExams = ref([
  {
    id: 'c-1',
    courseCode: 'ว22101 วิทยาศาสตร์ ม.2',
    category: 'แบบฝึกหัดท้ายหน่วย',
    title: 'แบบฝึกหัดหน่วยที่ 1: เซลล์ของสิ่งมีชีวิต',
    classroomInfo: 'ห้อง ม.2/1 - ม.2/2 (35 คน)',
    totalStudents: 35,
    avgScore: '8.42 / 10',
    summaryText: 'ตรวจครบถ้วนทุกคนแล้ว • คะแนนเฉลี่ย 8.42 / 10 คะแนน'
  },
  {
    id: 'c-2',
    courseCode: 'ว23101 วิทยาศาสตร์ ม.3',
    category: 'ควิซท้ายคาบ',
    title: 'ควิซท้ายคาบ: พันธุศาสตร์และการถ่ายทอดลักษณะ',
    classroomInfo: 'ปรนัยล้วน 15 ข้อ',
    totalStudents: 35,
    avgScore: '12.3 / 15',
    summaryText: 'ตรวจคำตอบอัตโนมัติทันทีที่นักเรียนส่ง • คะแนนเฉลี่ย 12.3 / 15 คะแนน'
  },
  {
    id: 'c-3',
    courseCode: 'ว30201 ฟิสิกส์ ม.4',
    category: 'แบบทดสอบย่อย',
    title: 'แบบทดสอบย่อย: การเคลื่อนที่และแรง',
    classroomInfo: 'ห้อง ม.4/1 (28 คน)',
    totalStudents: 28,
    avgScore: '16.5 / 20',
    summaryText: 'ตรวจให้คะแนนนักเรียนครบทั้งชั้นแล้ว • คะแนนเต็ม 20 คะแนน'
  }
])

// Load dynamic data from API if available
onMounted(async () => {
  try {
    const list = await examService.listExams()
    if (list && list.length > 0) {
      // If there are real closed/review exams from backend
      const reviewItems = list.filter((e) => e.status === 'CLOSED' || e.status === 'review')
      if (reviewItems.length > 0) {
        pendingExams.value = reviewItems.map((item) => ({
          id: item.id,
          courseCode: item.course?.code || item.courseCode || 'ว23101 วิทยาศาสตร์',
          category: item.category || 'สอบวัดผล',
          title: item.title,
          submittedCount: item.submittedCount || 32,
          totalStudents: item.totalStudents || 35,
          pendingCount: item.pendingCount || 3,
          autoGradedPercent: 100,
          hasEssay: true
        }))
      }
    }
  } catch (err) {
    console.warn('API note in grading view:', err.message)
  }
})

// Filtered lists
const filteredPendingExams = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return pendingExams.value.filter((e) => {
    if (!q) return true
    return e.title.toLowerCase().includes(q) || e.courseCode.toLowerCase().includes(q)
  })
})

const filteredCompletedExams = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return completedExams.value.filter((e) => {
    if (!q) return true
    return e.title.toLowerCase().includes(q) || e.courseCode.toLowerCase().includes(q)
  })
})

const shouldShowPendingSection = computed(() => {
  if (activeTab.value === 'completed') return false
  return filteredPendingExams.value.length > 0
})

const shouldShowCompletedSection = computed(() => {
  if (activeTab.value === 'pending') return false
  return filteredCompletedExams.value.length > 0
})

const noResultsFound = computed(() => {
  return !shouldShowPendingSection.value && !shouldShowCompletedSection.value
})

const resetSearch = () => {
  searchQuery.value = ''
  activeTab.value = 'all'
}

// User Actions
const startGrading = (exam) => {
  alert(`กำลังเปิดหน้าจอตรวจข้อเขียนและให้คะแนนทีละคนสำหรับ: ${exam.title}`)
}

const viewExamScores = (exam) => {
  selectedExamForScores.value = exam
}

const openGuideModal = () => {
  alert('เปิดคู่มือการตรวจข้อสอบ: การให้คะแนนอัตนัยแบบเกณฑ์รูบริก (Rubric) และการส่งผลสอบ')
}

const openHelpModal = () => {
  alert('ติดต่อฝ่ายสนับสนุนด้านการวัดผลและประเมินผลการศึกษา: โทร 02-xxx-xxxx หรืออีเมล support@examhub.local')
}
</script>

<style scoped src="@/assets/styles/views/teacher-grading.css"></style>
