<template>
  <TeacherLayout>
    <div class="student-mgmt-view">
      <!-- Top Title & Metrics Bar -->
      <TeacherHeaderStats
        v-model:selected-room="selectedRoomId"
        :rooms="roomOptions"
        :metrics="metrics"
        :loading="loadingClassrooms"
      />

      <!-- Page-level feedback -->
      <p v-if="pageError" class="student-mgmt-alert" role="alert">
        {{ pageError }}
      </p>
      <p v-else-if="noClassrooms" class="student-mgmt-alert student-mgmt-alert--info">
        ยังไม่มีห้องเรียนในระบบ — สร้างห้องเรียนก่อนแล้วจึงเพิ่มนักเรียนได้
      </p>

      <!-- Main Workspace: Table (Left 8 cols) + Add Form (Right 4 cols) -->
      <div class="student-mgmt-grid">
        <!-- Left: Student Table -->
        <div class="student-mgmt-grid__left">
          <StudentRosterTable
            :students="filteredStudents"
            v-model:search-query="searchQuery"
            :total-count="students.length"
            :loading="loadingStudents"
            @import-csv="handleImportCsv"
            @export-data="handleExportData"
            @manage-student="handleRemoveStudent"
          />
        </div>

        <!-- Right: Add Student Form -->
        <div class="student-mgmt-grid__right">
          <AddStudentForm
            v-model:classroomId="selectedRoomId"
            :classrooms="classrooms"
            :submitting="savingStudent"
            :disabled="loadingClassrooms || !selectedRoomId"
            :error="formError"
            :success="formSuccess"
            @add-student="handleAddStudent"
            @reset="clearFormFeedback"
            @download-template="handleDownloadTemplate"
          />
        </div>
      </div>
    </div>
  </TeacherLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import TeacherLayout from '@/layouts/TeacherLayout.vue'
import TeacherHeaderStats from '@/components/teacher/TeacherHeaderStats.vue'
import StudentRosterTable from '@/components/teacher/StudentRosterTable.vue'
import AddStudentForm from '@/components/teacher/AddStudentForm.vue'
import { studentService } from '@/services/studentService'

const classrooms = ref([])
const students = ref([])
const selectedRoomId = ref('')
const searchQuery = ref('')

const loadingClassrooms = ref(false)
const loadingStudents = ref(false)
const savingStudent = ref(false)

const pageError = ref('')
const formError = ref('')
const formSuccess = ref(null)

/** ตัวเลือกห้องเรียนใน dropdown — ใช้ชื่อ + รหัสวิชา + จำนวนนักเรียนจริง */
const roomOptions = computed(() =>
  classrooms.value.map((room) => {
    const count = room._count?.enrollments ?? 0
    const course = room.course?.code ? ` · ${room.course.code}` : ''
    return { id: room.id, label: `${room.name}${course} (${count} คน)` }
  })
)

/** metric pills นับจากรายชื่อที่โหลดมาจริง */
const metrics = computed(() => {
  const total = students.value.length
  const active = students.value.filter((student) => student.isActive).length
  return { total, active, inactive: total - active }
})

const noClassrooms = computed(
  () => !loadingClassrooms.value && classrooms.value.length === 0
)

const filteredStudents = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return students.value

  return students.value.filter(
    (student) =>
      student.name.toLowerCase().includes(q) ||
      student.studentCode.toLowerCase().includes(q) ||
      student.email.toLowerCase().includes(q) ||
      String(student.seat).includes(q)
  )
})

/** แปลง user จาก API → แถวในตาราง (seat มาจากลำดับในรายชื่อ) */
function toRosterRow(student, index) {
  const isActive = student.isActive !== false

  return {
    id: student.id,
    seat: index + 1,
    studentCode: student.studentCode ?? '',
    name: student.fullName ?? '',
    email: student.email ?? '',
    isActive,
    status: isActive ? 'graded' : 'unsubmitted',
    statusText: isActive ? 'ใช้งาน' : 'ระงับการใช้งาน',
    actionText: 'นำออกจากห้อง'
  }
}

async function loadClassrooms({ silent = false } = {}) {
  if (!silent) loadingClassrooms.value = true
  pageError.value = ''

  try {
    const list = await studentService.listClassrooms()
    classrooms.value = list

    const stillExists = list.some((room) => room.id === selectedRoomId.value)
    if (!stillExists) {
      selectedRoomId.value = list[0]?.id ?? ''
    }
  } catch (error) {
    pageError.value = error.message || 'โหลดรายการห้องเรียนไม่สำเร็จ'
    classrooms.value = []
  } finally {
    if (!silent) loadingClassrooms.value = false
  }
}

async function loadStudents() {
  if (!selectedRoomId.value) {
    students.value = []
    return
  }

  loadingStudents.value = true
  pageError.value = ''

  try {
    const list = await studentService.listClassroomStudents(selectedRoomId.value)
    students.value = list.map(toRosterRow)
  } catch (error) {
    pageError.value = error.message || 'โหลดรายชื่อนักเรียนไม่สำเร็จ'
    students.value = []
  } finally {
    loadingStudents.value = false
  }
}

async function handleAddStudent(payload) {
  if (!selectedRoomId.value) {
    formError.value = 'กรุณาเลือกห้องเรียนก่อน'
    return
  }

  savingStudent.value = true
  formError.value = ''
  formSuccess.value = null

  try {
    const result = await studentService.addStudentToClassroom(
      selectedRoomId.value,
      payload
    )

    formSuccess.value = {
      name: result?.student?.fullName ?? payload.fullName,
      temporaryPassword: result?.temporaryPassword ?? null
    }

    // ดึงรายชื่อล่าสุดจาก DB จริง แล้วอัปเดตจำนวนใน dropdown
    await loadStudents()
    await loadClassrooms({ silent: true })
  } catch (error) {
    formError.value = error.message || 'เพิ่มนักเรียนไม่สำเร็จ'
  } finally {
    savingStudent.value = false
  }
}

async function handleRemoveStudent(student) {
  if (!selectedRoomId.value) return

  const confirmed = window.confirm(
    `นำ ${student.name} ออกจากห้องนี้?\n(บัญชีนักเรียนยังอยู่ ไม่ได้ลบถาวร)`
  )
  if (!confirmed) return

  pageError.value = ''

  try {
    await studentService.removeStudentFromClassroom(
      selectedRoomId.value,
      student.id
    )
    await loadStudents()
    await loadClassrooms({ silent: true })
  } catch (error) {
    pageError.value = error.message || 'นำนักเรียนออกจากห้องไม่สำเร็จ'
  }
}

function clearFormFeedback() {
  formError.value = ''
  formSuccess.value = null
}

function handleImportCsv() {
  alert('เปิดหน้าต่างนำเข้าไฟล์ CSV รายชื่อนักเรียน')
}

function handleExportData() {
  alert('กำลังส่งออกข้อมูลรายชื่อนักเรียนเป็นไฟล์ Excel/CSV')
}

function handleDownloadTemplate() {
  alert('กำลังดาวน์โหลดแม่แบบ CSV (student_roster_template.csv)')
}

watch(selectedRoomId, () => {
  formError.value = ''
  formSuccess.value = null
  loadStudents()
})

onMounted(() => loadClassrooms())
</script>

<style scoped src="@/assets/styles/views/teacher-student-management.css"></style>
