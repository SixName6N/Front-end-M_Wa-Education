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

      <!-- ผลการรีเซ็ตรหัสผ่าน: โชว์รหัสใหม่ให้ครูคัดลอกส่งนักเรียน -->
      <AppStateNotice
        v-if="resetResult"
        variant="info"
        title="รีเซ็ตรหัสผ่านเรียบร้อย"
        :message="`รหัสผ่านใหม่ของ ${resetResult.name} — ส่งให้ผู้เรียนแล้วให้เข้าไปเปลี่ยนเองที่เมนู “เปลี่ยนรหัสผ่าน” ในหน้าโปรไฟล์`"
      >
        <code class="student-mgmt-password">{{ resetResult.password }}</code>
        <button type="button" class="student-mgmt-btn" @click="copyResetPassword">
          {{ copiedPassword ? 'คัดลอกแล้ว ✓' : 'คัดลอกรหัสผ่าน' }}
        </button>
        <button
          type="button"
          class="student-mgmt-btn student-mgmt-btn--ghost"
          @click="resetResult = null"
        >
          ปิด
        </button>
      </AppStateNotice>

      <!-- Hidden file input สำหรับนำเข้ารายชื่อนักเรียนจาก CSV / Excel -->
      <input
        ref="fileInputRef"
        type="file"
        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        class="student-mgmt-file-input"
        @change="onFileSelected"
      />

      <!-- Modal นำเข้ารายชื่อนักเรียน: 2-step (พรีวิว dryRun -> ยืนยันบันทึกจริงพร้อมรหัสผ่านชั่วคราว) -->
      <div
        v-if="showImportModal"
        class="import-modal-overlay"
        @click.self="handleCloseImportModal"
      >
        <div class="import-modal-box">
          <!-- Header -->
          <div class="import-modal-header">
            <div>
              <h3 class="import-modal-title">
                {{ importStep === 'result' ? 'ผลการนำเข้ารายชื่อนักเรียน' : 'ตรวจสอบข้อมูลก่อนนำเข้า (พรีวิว)' }}
              </h3>
              <p class="import-modal-subtitle">
                ห้องเรียน: <strong>{{ currentRoomName }}</strong> • ไฟล์: <strong>{{ selectedImportFileName }}</strong>
              </p>
            </div>
            <button
              type="button"
              class="import-modal-close"
              :disabled="importingCommit || importingPreview"
              @click="handleCloseImportModal"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="import-modal-body">
            <!-- Loading state: ตรวจสอบความถูกต้องของไฟล์แบบ dry-run -->
            <div v-if="importingPreview" class="import-modal-loading">
              <div class="import-spinner"></div>
              <p>กำลังตรวจสอบความถูกต้องของไฟล์กับฐานข้อมูล...</p>
            </div>

            <!-- Error State: ไฟล์มีข้อผิดพลาด (all-or-nothing) -->
            <div v-else-if="importError" class="import-modal-error-state">
              <AppStateNotice
                variant="error"
                title="ไฟล์ไม่ผ่านการตรวจสอบ"
                :message="importError"
              />

              <div v-if="importRowErrors.length > 0" class="import-error-table-wrapper">
                <p class="import-error-lead">
                  พบข้อผิดพลาดตามแถวดังต่อไปนี้ (ระบบยังไม่บันทึกข้อมูลใดๆ):
                </p>
                <div class="import-table-wrapper">
                  <table class="import-table import-table--error">
                    <thead>
                      <tr>
                        <th style="width: 80px;">แถวที่</th>
                        <th>รายละเอียดข้อผิดพลาด</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(err, idx) in importRowErrors" :key="idx">
                        <td class="import-error-row-num">{{ err.row }}</td>
                        <td class="import-error-row-msg">{{ err.message }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Preview State: ตรวจสอบผ่าน แสดงตัวเลขและรายชื่อที่จะทำรายการ -->
            <div
              v-else-if="importStep === 'preview' && importPreviewData"
              class="import-modal-preview"
            >
              <!-- Stats Summary -->
              <div class="import-stats-grid">
                <div class="import-stat-card">
                  <span class="import-stat-label">ทั้งหมดในไฟล์</span>
                  <span class="import-stat-value">{{ importPreviewData.total }} คน</span>
                </div>
                <div class="import-stat-card import-stat-card--create">
                  <span class="import-stat-label">จะสร้างบัญชีใหม่</span>
                  <span class="import-stat-value">{{ importPreviewData.wouldCreate }} คน</span>
                </div>
                <div class="import-stat-card import-stat-card--enroll">
                  <span class="import-stat-label">จะผูกเข้าห้องเรียน</span>
                  <span class="import-stat-value">{{ importPreviewData.wouldEnroll }} คน</span>
                </div>
                <div class="import-stat-card import-stat-card--skip">
                  <span class="import-stat-label">จะข้าม (อยู่ในห้องแล้ว)</span>
                  <span class="import-stat-value">{{ importPreviewData.wouldSkip }} คน</span>
                </div>
              </div>

              <div class="import-hint-box">
                ℹ️ หากกดยืนยัน ระบบจะสร้างบัญชีนักเรียนใหม่ (พร้อมสร้างรหัสผ่านชั่วคราว) และเพิ่มนักเรียนเข้าห้องเรียน <strong>{{ currentRoomName }}</strong> โดยอัตโนมัติ
              </div>

              <!-- Student preview list table -->
              <div class="import-table-wrapper">
                <table class="import-table">
                  <thead>
                    <tr>
                      <th style="width: 60px;">แถว</th>
                      <th>รหัสนักเรียน</th>
                      <th>ชื่อ - นามสกุล</th>
                      <th>อีเมล</th>
                      <th>สถานะการนำเข้า</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in importPreviewData.students" :key="item.row">
                      <td>{{ item.row }}</td>
                      <td>{{ item.studentCode || '-' }}</td>
                      <td style="font-weight: 500;">{{ item.fullName }}</td>
                      <td>{{ item.email }}</td>
                      <td>
                        <span
                          class="import-badge"
                          :class="{
                            'import-badge--create': item.status === 'created',
                            'import-badge--enroll': item.status === 'enrolled',
                            'import-badge--skip': item.status === 'skipped'
                          }"
                        >
                          {{
                            item.status === 'created'
                              ? 'สร้างบัญชีใหม่'
                              : item.status === 'enrolled'
                              ? 'ผูกเข้าห้อง'
                              : 'ข้าม (มีอยู่ในห้องแล้ว)'
                          }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Result State: นำเข้าจริงสำเร็จ แสดงข้อความและรหัสผ่านชั่วคราว -->
            <div
              v-else-if="importStep === 'result' && importResultData"
              class="import-modal-result"
            >
              <AppStateNotice
                variant="info"
                title="นำเข้ารายชื่อสำเร็จ"
                :message="importResultData.message || 'บันทึกรายชื่อนักเรียนเรียบร้อยแล้ว'"
              />

              <!-- Section: Created Students with Temporary Passwords -->
              <div
                v-if="createdStudentsWithPassword.length > 0"
                class="import-password-section"
              >
                <div class="import-password-header">
                  <div>
                    <h4 class="import-password-title">
                      🔑 รหัสผ่านชั่วคราวสำหรับบัญชีที่สร้างใหม่ ({{ createdStudentsWithPassword.length }} คน)
                    </h4>
                    <p class="import-password-desc">
                      รหัสผ่านนี้จะแสดงเฉพาะครั้งนี้เท่านั้น กรุณาคัดลอกส่งให้นักเรียนเพื่อนำไปเข้าสู่ระบบ
                    </p>
                  </div>
                  <button
                    type="button"
                    class="import-copy-all-btn"
                    @click="copyAllPasswords"
                  >
                    {{ copiedAll ? 'คัดลอกทั้งหมดแล้ว ✓' : 'คัดลอกข้อมูลทั้งหมด' }}
                  </button>
                </div>

                <div class="import-table-wrapper">
                  <table class="import-table">
                    <thead>
                      <tr>
                        <th>รหัสนักเรียน</th>
                        <th>ชื่อ - นามสกุล</th>
                        <th>อีเมล</th>
                        <th>รหัสผ่านชั่วคราว</th>
                        <th style="width: 80px; text-align: center;">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in createdStudentsWithPassword" :key="item.row">
                        <td>{{ item.studentCode || '-' }}</td>
                        <td style="font-weight: 500;">{{ item.fullName }}</td>
                        <td>{{ item.email }}</td>
                        <td>
                          <code class="student-mgmt-password">{{ item.temporaryPassword }}</code>
                        </td>
                        <td style="text-align: center;">
                          <button
                            type="button"
                            class="import-copy-single-btn"
                            @click="copySinglePassword(item)"
                          >
                            {{ copiedRowId === item.row ? 'คัดลอกแล้ว ✓' : 'คัดลอก' }}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-else class="import-hint-box">
                ไม่มีการสร้างบัญชีใหม่ (นักเรียนทุกคนมีบัญชีอยู่ในระบบแล้วและถูกผูกเข้าห้องเรียนเรียบร้อย)
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="import-modal-footer">
            <template v-if="importStep === 'preview'">
              <button
                v-if="importError"
                type="button"
                class="import-btn import-btn--primary"
                @click="fileInputRef?.click()"
              >
                เลือกไฟล์ใหม่
              </button>
              <button
                type="button"
                class="import-btn import-btn--ghost"
                :disabled="importingCommit || importingPreview"
                @click="handleCloseImportModal"
              >
                {{ importError ? 'ปิด' : 'ยกเลิก' }}
              </button>
              <button
                v-if="!importError && importPreviewData"
                type="button"
                class="import-btn import-btn--primary"
                :disabled="importingCommit || importingPreview || (importPreviewData.wouldCreate === 0 && importPreviewData.wouldEnroll === 0)"
                @click="confirmImportCommit"
              >
                {{ importingCommit ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันนำเข้าข้อมูล' }}
              </button>
            </template>

            <template v-else-if="importStep === 'result'">
              <button
                type="button"
                class="import-btn import-btn--primary"
                @click="handleCloseImportModal"
              >
                เสร็จสิ้น
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Main Workspace: Table (Left 8 cols) + Add Form (Right 4 cols) -->
      <div class="student-mgmt-grid">
        <!-- Left: Student Table -->
        <div class="student-mgmt-grid__left">
          <StudentRosterTable
            :students="filteredStudents"
            v-model:search-query="searchQuery"
            :total-count="students.length"
            :loading="loadingStudents"
            :busy-id="busyStudentId"
            @import-csv="handleImportCsv"
            @export-data="handleExportData"
            @manage-student="handleRemoveStudent"
            @reset-password="handleResetPassword"
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
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

const pageError = ref('')
const pageErrorStatus = ref(0)
const pageSuccess = ref('')
const formError = ref('')
const formErrorStatus = ref(0)
const formSuccess = ref(null)

/** ระหว่างรีเซ็ตรหัสผ่านนักเรียน (ปิดปุ่มกันกดซ้ำ) */
const busyStudentId = ref('')
/** ผลการรีเซ็ตรหัสผ่าน: { name, password } */
const resetResult = ref(null)
const copiedPassword = ref(false)
let copyTimer = null

/** hidden input สำหรับนำเข้ารายชื่อนักเรียนจากไฟล์ CSV / Excel */
const fileInputRef = ref(null)
const showImportModal = ref(false)
const importStep = ref('preview') // 'preview' | 'result'
const selectedImportFile = ref(null)
const selectedImportFileName = ref('')
const importingPreview = ref(false)
const importingCommit = ref(false)
const importError = ref('')
const importRowErrors = ref([])
const importPreviewData = ref(null)
const importResultData = ref(null)

const copiedAll = ref(false)
const copiedRowId = ref(null)
let copyAllTimer = null
let copyRowTimer = null

const currentRoomName = computed(() =>
  classrooms.value.find((r) => r.id === selectedRoomId.value)?.name || 'ห้องเรียน'
)

const createdStudentsWithPassword = computed(() =>
  (importResultData.value?.students || []).filter(
    (item) => item.status === 'created' && item.temporaryPassword
  )
)

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
    status: isActive ? 'active' : 'suspended',
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

/**
 * รีเซ็ตรหัสผ่านให้นักเรียน (ครูเท่านั้น)
 * ไม่ส่ง password ไป → backend สุ่มรหัสใหม่ 12 ตัวให้ แล้วโชว์ให้ครูคัดลอกส่งนักเรียน
 */
async function handleResetPassword(student) {
  if (!selectedRoomId.value) return

  const confirmed = window.confirm(
    `รีเซ็ตรหัสผ่านให้ ${student.name}?\nรหัสผ่านเดิมจะใช้ไม่ได้ทันที และระบบจะสุ่มรหัสใหม่ให้`
  )
  if (!confirmed) return

  busyStudentId.value = student.id
  pageSuccess.value = ''
  resetResult.value = null
  clearPageError()

  try {
    const password = await studentService.resetStudentPassword(student.id)
    resetResult.value = { name: student.name, password }
  } catch (error) {
    setPageError(error, 'รีเซ็ตรหัสผ่านไม่สำเร็จ')
  } finally {
    busyStudentId.value = ''
  }
}

/** คัดลอกรหัสผ่านใหม่ไปคลิปบอร์ด (มี fallback สำหรับเบราว์เซอร์ที่บล็อก clipboard API) */
async function copyResetPassword() {
  const password = resetResult.value?.password
  if (!password) return

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(password)
    } else {
      const area = document.createElement('textarea')
      area.value = password
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    copiedPassword.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copiedPassword.value = false
    }, 2000)
  } catch (error) {
    console.error('คัดลอกรหัสผ่านไม่สำเร็จ:', error)
    setPageError(error, 'คัดลอกรหัสผ่านไม่สำเร็จ กรุณาคัดลอกจากข้อความโดยตรง')
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
    setPageError(null, 'กรุณาเลือกห้องเรียนก่อนนำเข้ารายชื่อนักเรียน')
    return
  }
  clearPageError()
  fileInputRef.value?.click()
}

function handleCloseImportModal() {
  if (importingCommit.value || importingPreview.value) return
  showImportModal.value = false
  selectedImportFile.value = null
  selectedImportFileName.value = ''
  importPreviewData.value = null
  importResultData.value = null
  importError.value = ''
  importRowErrors.value = []
}

async function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // ล้างค่าเพื่อให้เลือกไฟล์เดิมซ้ำได้ถ้าต้องการ
  event.target.value = ''

  const lowerName = file.name.toLowerCase()
  if (!lowerName.endsWith('.csv') && !lowerName.endsWith('.xlsx')) {
    setPageError(null, 'กรุณาเลือกไฟล์นามสกุล .csv หรือ .xlsx เท่านั้น')
    pageSuccess.value = ''
    return
  }

  if (!selectedRoomId.value) {
    setPageError(null, 'กรุณาเลือกห้องเรียนก่อนนำเข้ารายชื่อนักเรียน')
    return
  }

  selectedImportFile.value = file
  selectedImportFileName.value = file.name
  showImportModal.value = true
  importStep.value = 'preview'
  importingPreview.value = true
  importError.value = ''
  importRowErrors.value = []
  importPreviewData.value = null
  importResultData.value = null

  try {
    const result = await studentService.importStudentsFile(
      selectedRoomId.value,
      file,
      { dryRun: true }
    )
    importPreviewData.value = result
  } catch (error) {
    importError.value = error.message || 'ไฟล์มีข้อผิดพลาด'
    if (Array.isArray(error.details)) {
      importRowErrors.value = error.details
    }
  } finally {
    importingPreview.value = false
  }
}

async function confirmImportCommit() {
  if (!selectedImportFile.value || !selectedRoomId.value) return

  importingCommit.value = true
  importError.value = ''
  importRowErrors.value = []

  try {
    const result = await studentService.importStudentsFile(
      selectedRoomId.value,
      selectedImportFile.value,
      { dryRun: false }
    )
    importResultData.value = result
    importStep.value = 'result'

    // รีเฟรชรายชื่อจริงและจำนวนในห้องเรียน
    await loadStudents()
    await loadClassrooms({ silent: true })
  } catch (error) {
    importError.value = error.message || 'นำเข้าข้อมูลไม่สำเร็จ'
    if (Array.isArray(error.details)) {
      importRowErrors.value = error.details
    }
  } finally {
    importingCommit.value = false
  }
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    return true
  } catch {
    return false
  }
}

async function copyAllPasswords() {
  if (createdStudentsWithPassword.value.length === 0) return

  const rows = createdStudentsWithPassword.value.map(
    (s) => `${s.studentCode || '-'}\t${s.fullName}\t${s.email}\t${s.temporaryPassword}`
  )
  const header = 'รหัสนักเรียน\tชื่อ - นามสกุล\tอีเมล\tรหัสผ่านชั่วคราว'
  const text = [header, ...rows].join('\n')

  const ok = await copyTextToClipboard(text)
  if (ok) {
    copiedAll.value = true
    if (copyAllTimer) clearTimeout(copyAllTimer)
    copyAllTimer = setTimeout(() => {
      copiedAll.value = false
    }, 2000)
  }
}

async function copySinglePassword(item) {
  if (!item?.temporaryPassword) return

  const ok = await copyTextToClipboard(item.temporaryPassword)
  if (ok) {
    copiedRowId.value = item.row
    if (copyRowTimer) clearTimeout(copyRowTimer)
    copyRowTimer = setTimeout(() => {
      copiedRowId.value = null
    }, 2000)
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
  // เปลี่ยนห้อง → ซ่อนรหัสผ่านที่เพิ่งรีเซ็ตของนักเรียนห้องเดิม
  resetResult.value = null
  copiedPassword.value = false
  loadStudents()
})

onMounted(() => loadClassrooms())

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer)
  if (copyAllTimer) clearTimeout(copyAllTimer)
  if (copyRowTimer) clearTimeout(copyRowTimer)
})
</script>

<style scoped src="@/assets/styles/views/teacher-student-management.css"></style>
