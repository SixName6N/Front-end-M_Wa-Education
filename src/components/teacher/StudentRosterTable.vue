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
          placeholder="ค้นหาชื่อ, รหัสนักเรียน หรือเลขที่..."
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
              <th>สถานะการสอบ</th>
              <th style="text-align: center;">คะแนน</th>
              <th style="text-align: right;">จัดการ</th>
            </tr>
          </thead>
          <tbody>
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

              <!-- ID -->
              <td class="roster-table__id">{{ student.id }}</td>

              <!-- Name -->
              <td class="roster-table__name">{{ student.name }}</td>

              <!-- Status Badge -->
              <td>
                <span
                  class="roster-status-badge"
                  :class="`roster-status-badge--${student.status}`"
                >
                  <span class="roster-status-dot"></span>
                  <span>{{ student.statusText }}</span>
                </span>
              </td>

              <!-- Score -->
              <td class="roster-table__score">
                <template v-if="student.score !== null">
                  {{ student.score }}
                  <span class="roster-table__score-max">/ {{ student.maxScore }}</span>
                </template>
                <template v-else-if="student.status === 'pending'">
                  <span class="roster-table__score--empty">-- / {{ student.maxScore }}</span>
                </template>
                <template v-else>
                  <span class="roster-table__score--empty">--</span>
                </template>
              </td>

              <!-- Actions -->
              <td class="roster-table__manage">
                <button
                  type="button"
                  class="roster-btn-link"
                  :class="{
                    'roster-btn-link--primary': student.status === 'graded',
                    'roster-btn-link--teal': student.status === 'pending',
                    'roster-btn-link--muted': student.status === 'unsubmitted'
                  }"
                  @click="$emit('manage-student', student)"
                >
                  {{ student.actionText }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="roster-pagination">
        <span>แสดง {{ students.length }} จาก {{ totalCount }} รายการ</span>
        <div class="roster-pagination__controls">
          <button
            type="button"
            class="roster-pagination__btn"
            disabled
            aria-label="Previous"
          >
            <IconChevronLeft size="14" />
          </button>
          <button type="button" class="roster-pagination__btn roster-pagination__btn--active">1</button>
          <button type="button" class="roster-pagination__btn">2</button>
          <button type="button" class="roster-pagination__btn">3</button>
          <button
            type="button"
            class="roster-pagination__btn"
            aria-label="Next"
          >
            <IconChevronRight size="14" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import IconUpload from '@/components/icons/IconUpload.vue'
import IconDownload from '@/components/icons/IconDownload.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'

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
    default: 35
  }
})

defineEmits([
  'update:searchQuery',
  'import-csv',
  'export-data',
  'manage-student'
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
</script>

<style scoped src="@/assets/styles/components/student-roster-table.css"></style>
