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

      <!-- Page-level feedback: แสดงการแจ้งเตือนและข้อผิดพลาด -->
      <AppStateNotice
        v-if="pageError"
        variant="error"
        :code="pageErrorCode"
        title="เกิดข้อผิดพลาด"
        :message="pageError"
        retry-label="ลองใหม่"
        @retry="retryLoad"
      />
      <AppStateNotice
        v-else-if="pageSuccess"
        variant="info"
        title="ดำเนินการสำเร็จ"
        :message="pageSuccess"
      />
      <AppStateNotice
        v-else-if="noClassrooms"
        variant="empty"
        title="ยังไม่มีข้อมูลห้องเรียน"
        message="ยังไม่มีห้องเรียนในระบบ — สร้างห้องเรียนก่อนแล้วจึงเพิ่มนักเรียนได้"
      />

      <!-- Hidden file input for CSV import -->
      <input
        ref="fileInputRef"
        type="file"
        accept=".csv"
        style="display: none;"
        @change="onFileSelected"
      />

      <!-- Main Workspace: Table (Left 8 cols) + Add Form (Right 4 cols) -->
      <div class="student-mgmt-grid">
        <!-- Left: Student Table -->
        <div class="student-mgmt-grid__left">
          <StudentRosterTable
            :students="filteredStudents"
            v-model:search-query="searchQuery"
            :total-count="students.length"
            :loading="loadingStudents || importingCsv"
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
            :error-code="formErrorCode"
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
import AppStateNotice from '@/components/common/AppStateNotice.vue'
import { studentService } from '@/services/studentService'

const classrooms = ref([])
const students = ref([])
const selectedRoomId = ref('')
const searchQuery = ref('')

const loadingClassrooms = ref(false)
const loadingStudents = ref(false)
const savingStudent = ref(false)
const importingCsv = ref(false)
const fileInputRef = ref(null)

const pageError = ref('')
const pageErrorStatus = ref(0)
const pageSuccess = ref('')
const formError = ref('')
const formErrorStatus = ref(0)
const formSuccess = ref(null)

/** แสดงรหัส HTTP ที่ backend ตอบกลับ เพื่อให้ debug ได้ง่าย */
const pageErrorCode = computed(() =>
  pageErrorStatus.value > 0 ? `HTTP ${pageErrorStatus.value}` : 'NETWORK'
)
const formErrorCode = computed(() =>
  formErrorStatus.value > 0 ? `HTTP ${formErrorStatus.value}` : ''
)

function setPageError(error, fallbackMessage) {
  pageError.value = error?.message || fallbackMessage
  pageErrorStatus.value = error?.status ?? 0
}

function clearPageError() {
  pageError.value = ''
  pageErrorStatus.value = 0
}

/** ตัวเลือกห้องเรียน — ส่งชื่อห้อง (แยกชั้น/ห้องเองในตัวเลือก) + จำนวนนักเรียนจริง */
const roomOptions = computed(() =>
  classrooms.value.map((room) => ({
    id: room.id,
    name: room.name,
    count: room._count?.enrollments ?? 0
  }))
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
  clearPageError()

  try {
    const list = await studentService.listClassrooms()
    classrooms.value = list

    const stillExists = list.some((room) => room.id === selectedRoomId.value)
    if (!stillExists) {
      selectedRoomId.value = list[0]?.id ?? ''
    }
  } catch (error) {
    setPageError(error, 'โหลดรายการห้องเรียนไม่สำเร็จ')
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
  clearPageError()

  try {
    const list = await studentService.listClassroomStudents(selectedRoomId.value)
    students.value = list.map(toRosterRow)
  } catch (error) {
    setPageError(error, 'โหลดรายชื่อนักเรียนไม่สำเร็จ')
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
  formErrorStatus.value = 0
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
    formErrorStatus.value = error.status ?? 0
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
  pageErrorStatus.value = 0

  try {
    await studentService.removeStudentFromClassroom(
      selectedRoomId.value,
      student.id
    )
    await loadStudents()
    await loadClassrooms({ silent: true })
  } catch (error) {
    setPageError(error, 'นำนักเรียนออกจากห้องไม่สำเร็จ')
  }
}

/** ปุ่ม "ลองใหม่" บนกล่องแจ้ง error */
function retryLoad() {
  if (classrooms.value.length === 0) {
    loadClassrooms()
  } else {
    loadStudents()
  }
}

function clearFormFeedback() {
  formError.value = ''
  formErrorStatus.value = 0
  formSuccess.value = null
}

function handleImportCsv() {
  if (!selectedRoomId.value) {
    pageError.value = 'กรุณาเลือกห้องเรียนก่อนนำเข้าไฟล์ CSV'
    return
  }
  fileInputRef.value?.click()
}

async function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // ล้างค่าเพื่อให้เลือกไฟล์เดิมซ้ำได้ถ้าต้องการ
  event.target.value = ''

  if (!file.name.toLowerCase().endsWith('.csv')) {
    pageError.value = 'กรุณาเลือกไฟล์นามสกุล .csv เท่านั้น'
    pageSuccess.value = ''
    return
  }

  importingCsv.value = true
  pageError.value = ''
  pageSuccess.value = ''

  try {
    const result = await studentService.importStudentsCsv(selectedRoomId.value, file)
    pageSuccess.value = result?.message || `นำเข้ารายชื่อนักเรียนจากไฟล์ "${file.name}" สำเร็จ`

    // โหลดรายชื่อจริงจากฐานข้อมูลหลังบันทึกเสร็จ (ไม่มีการ mock)
    await loadStudents()
    await loadClassrooms({ silent: true })
  } catch (error) {
    console.error('รายละเอียดข้อผิดพลาดการนำเข้าไฟล์ CSV (Console Only):', error.technical || error.message || error)
    pageError.value = 'นำเข้าข้อมูลไม่สำเร็จ'
  } finally {
    importingCsv.value = false
  }
}

async function handleExportData() {
  if (!selectedRoomId.value) {
    pageError.value = 'กรุณาเลือกห้องเรียนก่อนส่งออกข้อมูล'
    pageSuccess.value = ''
    return
  }
  const currentRoom = classrooms.value.find((r) => r.id === selectedRoomId.value)
  const roomName = currentRoom?.name || 'classroom'
  try {
    await studentService.exportClassroomStudentsCsv(selectedRoomId.value, roomName)
    pageSuccess.value = 'ส่งออกข้อมูลรายชื่อนักเรียนเรียบร้อยแล้ว'
    pageError.value = ''
  } catch (error) {
    console.error('รายละเอียดข้อผิดพลาดการส่งออกข้อมูล (Console Only):', error.technical || error.message || error)
    pageError.value = 'ส่งออกข้อมูลรายชื่อนักเรียนไม่สำเร็จ'
    pageSuccess.value = ''
  }
}

async function handleDownloadTemplate() {
  try {
    await studentService.downloadTemplate()
    pageSuccess.value = 'ดาวน์โหลดแม่แบบ CSV เรียบร้อยแล้ว'
    pageError.value = ''
  } catch (error) {
    console.error('รายละเอียดข้อผิดพลาดการดาวน์โหลดแม่แบบ (Console Only):', error.technical || error.message || error)
    pageError.value = 'ดาวน์โหลดแม่แบบไม่สำเร็จ'
    pageSuccess.value = ''
  }
}

watch(selectedRoomId, () => {
  formError.value = ''
  formSuccess.value = null
  pageSuccess.value = ''
  loadStudents()
})

onMounted(() => loadClassrooms())
</script>

<style scoped src="@/assets/styles/views/teacher-student-management.css"></style>
