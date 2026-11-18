<template>
  <div class="teacher-layout">
    <!-- Teacher Navbar -->
    <header class="teacher-navbar">
      <div class="teacher-navbar__inner">
        <!-- Left: Logo & Navigation Menu -->
        <div class="teacher-navbar__left">
          <router-link to="/teacher/students" class="teacher-navbar__brand">
            <div class="teacher-navbar__logo">
              <IconExamHub size="18" />
            </div>
            <span>ExamHub</span>
          </router-link>

          <nav class="teacher-navbar__nav">
            <router-link
              to="/teacher/exams"
              class="teacher-navbar__link"
              :class="{ 'teacher-navbar__link--active': isExamsActive }"
            >
              คลังข้อสอบ
            </router-link>
            <a href="#" class="teacher-navbar__link" @click.prevent>ตรวจข้อสอบ</a>
            <router-link
              to="/teacher/students"
              class="teacher-navbar__link"
              :class="{ 'teacher-navbar__link--active': isStudentsActive }"
            >
              รายชื่อนักเรียน
            </router-link>
          </nav>
        </div>

        <!-- Right: Role Switch & Teacher Profile -->
        <div class="teacher-navbar__right">
          <!-- Role Switcher -->
          <div class="teacher-navbar__role-switch">
            <span class="teacher-navbar__role-btn teacher-navbar__role-btn--active">ครูผู้สอน</span>
            <router-link to="/student/exams" class="teacher-navbar__role-btn">นักเรียน</router-link>
          </div>

          <div class="teacher-navbar__divider"></div>

          <!-- Teacher Profile -->
          <div class="teacher-navbar__profile">
            <div class="teacher-navbar__avatar">
              <span>ครู</span>
            </div>
            <span class="teacher-navbar__teacher-name">{{ teacher.shortName }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="teacher-layout__main">
      <slot />
    </main>

    <!-- Teacher Footer -->
    <footer class="teacher-footer">
      <div class="teacher-footer__inner">
        <div class="teacher-footer__brand">
          <strong>ExamHub</strong>
          <span>•</span>
          <span>ระบบคลังข้อสอบและตรวจผลสอบ</span>
        </div>
        <div>
          <span>อาจารย์ผู้สอน: {{ teacher.name }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import IconExamHub from '@/components/icons/IconExamHub.vue'
import { TEACHER_PROFILE } from '@/constants/teacher.constants'

const props = defineProps({
  activeTab: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const teacher = TEACHER_PROFILE

const isExamsActive = computed(() => {
  return props.activeTab === 'exams' || (route && route.path && route.path.startsWith('/teacher/exam'))
})

const isStudentsActive = computed(() => {
  if (props.activeTab === 'students') return true
  if (props.activeTab === 'exams') return false
  return !route || !route.path || route.path.startsWith('/teacher/student') || route.path === '/teacher'
})
</script>

<style scoped src="@/assets/styles/layouts/teacher-layout.css"></style>
