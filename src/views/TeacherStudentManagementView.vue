<template>
  <TeacherLayout>
    <div class="student-mgmt-view">
      <!-- Top Title & Metrics Bar -->
      <TeacherHeaderStats v-model:selected-room="selectedRoom" />

      <!-- Main Workspace: Table (Left 8 cols) + Add Form (Right 4 cols) -->
      <div class="student-mgmt-grid">
        <!-- Left: Student Table -->
        <div class="student-mgmt-grid__left">
          <StudentRosterTable
            :students="filteredStudents"
            v-model:search-query="searchQuery"
            :total-count="students.length"
            @import-csv="handleImportCsv"
            @export-data="handleExportData"
            @manage-student="handleManageStudent"
          />
        </div>

        <!-- Right: Add Student Form -->
        <div class="student-mgmt-grid__right">
          <AddStudentForm
            @add-student="handleAddStudent"
            @download-template="handleDownloadTemplate"
          />
        </div>
      </div>
    </div>
  </TeacherLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import TeacherLayout from '@/layouts/TeacherLayout.vue'
import TeacherHeaderStats from '@/components/teacher/TeacherHeaderStats.vue'
import StudentRosterTable from '@/components/teacher/StudentRosterTable.vue'
import AddStudentForm from '@/components/teacher/AddStudentForm.vue'
import { INITIAL_STUDENTS } from '@/constants/teacher.constants'

const selectedRoom = ref('m3-1')
const searchQuery = ref('')
const students = ref([...INITIAL_STUDENTS])

const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) return students.value
  const q = searchQuery.value.toLowerCase().trim()
  return students.value.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      String(s.seat).includes(q)
  )
})

const handleAddStudent = (newStudent) => {
  students.value.push(newStudent)
  alert(`เพิ่มนักเรียน ${newStudent.name} เรียบร้อยแล้ว`)
}

const handleImportCsv = () => {
  alert('เปิดหน้าต่างนำเข้าไฟล์ CSV รายชื่อนักเรียน')
}

const handleExportData = () => {
  alert('กำลังส่งออกข้อมูลรายชื่อนักเรียนและผลสอบเป็นไฟล์ Excel/CSV')
}

const handleManageStudent = (student) => {
  alert(`${student.actionText}: ${student.name}`)
}

const handleDownloadTemplate = () => {
  alert('กำลังดาวน์โหลดแม่แบบ CSV (student_roster_template.csv)')
}
</script>

<style scoped src="@/assets/styles/views/teacher-student-management.css"></style>
