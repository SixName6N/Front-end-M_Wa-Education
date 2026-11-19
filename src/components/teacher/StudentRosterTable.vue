<template>
  <div class="roster-section">
    <!-- Toolbar: Search + Quick Tools -->
    <div class="roster-toolbar">
      <div class="roster-search">
        <span class="roster-search__icon">
          <IconSearch size="16" />
        </span>
        <input
          :value="searchQuery"
          type="text"
          class="roster-search__input"
          placeholder="ค้นหาชื่อ, รหัสนักเรียน, อีเมล หรือเลขที่..."
          @input="$emit('update:searchQuery', $event.target.value)"
        />
      </div>

      <div class="roster-actions">
        <button
          type="button"
          class="roster-action-btn"
          @click="$emit('import-csv')"
        >
          <IconUpload size="15" />
          <span>นำเข้า CSV</span>
        </button>

        <button
          type="button"
          class="roster-action-btn"
          @click="$emit('export-data')"
        >
          <IconDownload size="15" />
          <span>ส่งออก</span>
        </button>
      </div>
    </div>

    <!-- Table Card -->
    <div class="roster-table-card">
      <div class="roster-table-responsive">
        <table class="roster-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">
                <input
                  type="checkbox"
                  class="roster-table__checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                />
              </th>
              <th style="width: 60px;">เลขที่</th>
              <th style="width: 90px;">รหัส</th>
              <th>ชื่อ - นามสกุล</th>
              <th>อีเมล</th>
              <th>สถานะบัญชี</th>
              <th style="text-align: right;">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="roster-table__empty">กำลังโหลดรายชื่อ...</td>
            </tr>

            <tr v-else-if="students.length === 0">
              <td colspan="7" class="roster-table__empty">
                {{ emptyText }}
              </td>
            </tr>

            <template v-else>
              <tr
                v-for="student in students"
                :key="student.id"
              >
                <!-- Checkbox -->
                <td style="text-align: center;">
                  <input
                    v-model="selectedStudents"
                    type="checkbox"
                    :value="student.id"
                    class="roster-table__checkbox"
                  />
                </td>

                <!-- Seat -->
                <td class="roster-table__seat">{{ student.seat }}</td>

                <!-- Student code -->
                <td class="roster-table__id">{{ student.studentCode || '—' }}</td>

                <!-- Name -->
                <td class="roster-table__name">{{ student.name }}</td>

                <!-- Email -->
                <td class="roster-table__email">{{ student.email || '—' }}</td>

                <!-- Account status -->
                <td>
                  <span
                    class="roster-status-badge"
                    :class="`roster-status-badge--${student.status}`"
                  >
                    <span class="roster-status-dot"></span>
                    <span>{{ student.statusText }}</span>
                  </span>
                </td>

                <!-- Actions -->
                <td class="roster-table__manage">
                  <div class="roster-table__actions">
                    <button
                      type="button"
                      class="roster-btn-link"
                      :class="student.isActive ? 'roster-btn-link--warn' : 'roster-btn-link--teal'"
                      :disabled="busyId === student.id"
                      :title="student.isActive
                        ? 'ระงับบัญชีนี้ — นักเรียนจะเข้าสู่ระบบไม่ได้ทุกห้องเรียน'
                        : 'เปิดใช้งานบัญชีนี้อีกครั้ง'"
                      @click="$emit('toggle-status', student)"
                    >
                      {{ student.isActive ? 'ระงับการใช้งาน' : 'เปิดใช้งาน' }}
                    </button>

                    <button
                      type="button"
                      class="roster-btn-link roster-btn-link--danger"
                      :disabled="busyId === student.id"
                      @click="$emit('manage-student', student)"
                    >
                      {{ student.actionText }}
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="roster-pagination">
        <span>แสดง {{ students.length }} จาก {{ totalCount }} รายการ</span>
        <span class="roster-pagination__page">หน้า 1 / 1</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import IconUpload from '@/components/icons/IconUpload.vue'
import IconDownload from '@/components/icons/IconDownload.vue'

const props = defineProps({
  students: {
    type: Array,
    required: true
  },
  searchQuery: {
    type: String,
    default: ''
  },
  totalCount: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  },
  /** ข้อความตอนตารางว่าง (แยกกรณี "ห้องว่าง" กับ "ไม่ตรงตัวกรอง") */
  emptyText: {
    type: String,
    default: 'ยังไม่มีนักเรียนในห้องนี้ — เพิ่มได้จากฟอร์มด้านขวา'
  },
  /** id ของนักเรียนที่กำลังบันทึกสถานะอยู่ (ปุ่มจะถูกปิดชั่วคราว) */
  busyId: {
    type: String,
    default: ''
  }
})

defineEmits([
  'update:searchQuery',
  'import-csv',
  'export-data',
  'manage-student',
  'toggle-status'
])

const selectedStudents = ref([])

const isAllSelected = computed(() => {
  return (
    props.students.length > 0 &&
    selectedStudents.value.length === props.students.length
  )
})

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectedStudents.value = props.students.map((s) => s.id)
  } else {
    selectedStudents.value = []
  }
}

// เปลี่ยนห้อง/รีโหลดรายชื่อ → ตัด id ที่ไม่มีอยู่แล้วออกจากที่เลือกไว้
watch(
  () => props.students,
  (list) => {
    const ids = new Set(list.map((student) => student.id))
    selectedStudents.value = selectedStudents.value.filter((id) => ids.has(id))
  }
)
</script>

<style scoped src="@/assets/styles/components/student-roster-table.css"></style>
