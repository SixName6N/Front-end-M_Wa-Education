<template>
  <div class="teacher-header-stats">
    <!-- Left: Title & Breadcrumbs -->
    <div>
      <div class="teacher-header-stats__breadcrumb">
        <span>ห้องเรียน</span>
        <IconChevronRight size="12" />
        <span>{{ session }}</span>
      </div>
      <h1 class="teacher-header-stats__title">จัดการรายชื่อนักเรียน</h1>
    </div>

    <!-- Right: Room selector & Quick metric pills -->
    <div class="teacher-header-stats__controls">
      <!-- Classroom picker (โหลดจาก API): แยกชั้น/ห้อง + ค้นหา real-time -->
      <ClassroomPicker
        variant="header"
        :model-value="selectedRoom"
        :classrooms="rooms"
        :loading="loading"
        search-placeholder="ค้นหาห้อง..."
        @update:model-value="$emit('update:selectedRoom', $event)"
      />

      <!-- Metric stats pills (นับจากรายชื่อจริงในห้อง) — กดเพื่อกรองตามสถานะบัญชี -->
      <div
        class="teacher-header-stats__metrics"
        role="group"
        aria-label="กรองรายชื่อตามสถานะบัญชี"
      >
        <button
          type="button"
          class="teacher-header-stats__metric-item"
          :class="{ 'teacher-header-stats__metric-item--active': statusFilter === 'all' }"
          :aria-pressed="statusFilter === 'all'"
          title="แสดงนักเรียนทุกคน"
          @click="$emit('update:statusFilter', 'all')"
        >
          <span class="teacher-header-stats__dot teacher-header-stats__dot--gray"></span>
          <span>ทั้งหมด: <strong>{{ metrics.total }}</strong></span>
        </button>

        <span class="teacher-header-stats__sep">|</span>

        <button
          type="button"
          class="teacher-header-stats__metric-item"
          :class="{ 'teacher-header-stats__metric-item--active': statusFilter === 'active' }"
          :aria-pressed="statusFilter === 'active'"
          title="แสดงเฉพาะบัญชีที่ใช้งานได้"
          @click="$emit('update:statusFilter', 'active')"
        >
          <span class="teacher-header-stats__dot teacher-header-stats__dot--green"></span>
          <span>ใช้งาน: <strong>{{ metrics.active }}</strong></span>
        </button>

        <span class="teacher-header-stats__sep">|</span>

        <button
          type="button"
          class="teacher-header-stats__metric-item"
          :class="{ 'teacher-header-stats__metric-item--active': statusFilter === 'inactive' }"
          :aria-pressed="statusFilter === 'inactive'"
          title="แสดงเฉพาะบัญชีที่ถูกระงับ"
          @click="$emit('update:statusFilter', 'inactive')"
        >
          <span class="teacher-header-stats__dot teacher-header-stats__dot--amber"></span>
          <span>ระงับ: <strong>{{ metrics.inactive }}</strong></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import ClassroomPicker from '@/components/common/ClassroomPicker.vue'
import { TEACHER_PROFILE } from '@/constants/teacher.constants'

defineProps({
  selectedRoom: {
    type: String,
    default: ''
  },
  rooms: {
    type: Array,
    default: () => []
  },
  metrics: {
    type: Object,
    default: () => ({ total: 0, active: 0, inactive: 0 })
  },
  /** ตัวกรองสถานะบัญชีที่เลือกอยู่: 'all' | 'active' | 'inactive' */
  statusFilter: {
    type: String,
    default: 'all'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:selectedRoom', 'update:statusFilter'])

const session = TEACHER_PROFILE.academicSession
</script>

<style scoped src="@/assets/styles/components/teacher-header-stats.css"></style>
