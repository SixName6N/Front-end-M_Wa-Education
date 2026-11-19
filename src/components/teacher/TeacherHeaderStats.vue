<template>
  <div class="teacher-header-stats">
    <!-- Left: Title & Breadcrumbs -->
    <div>
      <div class="teacher-header-stats__breadcrumb">
        <span>ห้องเรียน</span>
        <template v-if="session">
          <IconChevronRight size="12" />
          <span>{{ session }}</span>
        </template>
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

      <!-- Metric stats pills (นับจากรายชื่อจริงในห้อง) -->
      <div class="teacher-header-stats__metrics">
        <div class="teacher-header-stats__metric-item">
          <span class="teacher-header-stats__dot teacher-header-stats__dot--green"></span>
          <span>ทั้งหมด: <strong>{{ metrics.total }}</strong></span>
        </div>

        <span class="teacher-header-stats__sep">|</span>

        <div class="teacher-header-stats__metric-item">
          <span class="teacher-header-stats__dot teacher-header-stats__dot--amber"></span>
          <span>ใช้งาน: <strong>{{ metrics.active }}</strong></span>
        </div>

        <span class="teacher-header-stats__sep">|</span>

        <div class="teacher-header-stats__metric-item">
          <span class="teacher-header-stats__dot teacher-header-stats__dot--gray"></span>
          <span>ระงับ: <strong>{{ metrics.inactive }}</strong></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import ClassroomPicker from '@/components/common/ClassroomPicker.vue'

defineProps({
  session: {
    type: String,
    default: ''
  },
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
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:selectedRoom'])
</script>

<style scoped src="@/assets/styles/components/teacher-header-stats.css"></style>
