<template>
  <div class="exam-filter">
    <!-- Search Bar -->
    <div class="exam-filter__search">
      <span class="exam-filter__search-icon">
        <IconSearch size="18" />
      </span>
      <input
        type="text"
        :value="modelValue"
        class="exam-filter__search-input"
        placeholder="ค้นหารหัสวิชา, ชื่อวิชา หรือชื่อครูผู้สอน..."
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>

    <!-- Filter Buttons -->
    <div class="exam-filter__options" role="tablist">
      <button
        v-for="opt in (options || FILTER_OPTIONS)"
        :key="opt.id"
        type="button"
        class="exam-filter__pill"
        :class="{ 'exam-filter__pill--active': activeFilter === opt.id }"
        @click="$emit('select-filter', opt.id)"
      >
        <span>{{ opt.label }} ({{ opt.count }})</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import IconSearch from '@/components/icons/IconSearch.vue'
import { FILTER_OPTIONS } from '@/constants/exam.constants'

defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  activeFilter: {
    type: String,
    default: 'all'
  },
  options: {
    type: Array,
    default: null
  }
})

defineEmits(['update:modelValue', 'select-filter'])
</script>

<style scoped src="@/assets/styles/components/exam-filter.css"></style>
