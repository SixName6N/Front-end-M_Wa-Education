<template>
  <div class="role-selector" role="tablist" aria-label="เลือกประเภทผู้ใช้งาน">
    <button
      type="button"
      role="tab"
      :aria-selected="currentRole === USER_ROLES.STUDENT"
      class="role-selector__tab"
      :class="{ 'role-selector__tab--active': currentRole === USER_ROLES.STUDENT }"
      @click="$emit('select', USER_ROLES.STUDENT)"
    >
      <IconStudent size="18" />
      <span>นักเรียน (Student)</span>
    </button>

    <button
      type="button"
      role="tab"
      :aria-selected="currentRole === USER_ROLES.TEACHER"
      class="role-selector__tab"
      :class="{ 'role-selector__tab--active': currentRole === USER_ROLES.TEACHER }"
      @click="$emit('select', USER_ROLES.TEACHER)"
    >
      <IconTeacher size="18" />
      <span>ครูผู้สอน (Teacher)</span>
    </button>
  </div>
</template>

<script setup>
import { USER_ROLES } from '@/constants/auth.constants'
import IconStudent from '@/components/icons/IconStudent.vue'
import IconTeacher from '@/components/icons/IconTeacher.vue'

defineProps({
  currentRole: {
    type: String,
    default: USER_ROLES.STUDENT
  }
})

defineEmits(['select'])
</script>

<style scoped src="@/assets/styles/components/role-selector.css"></style>
