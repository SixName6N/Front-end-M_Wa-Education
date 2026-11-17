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
            <a href="#" class="teacher-navbar__link" @click.prevent>คลังข้อสอบ</a>
            <a href="#" class="teacher-navbar__link" @click.prevent>ตรวจข้อสอบ</a>
            <router-link
              to="/teacher/students"
              class="teacher-navbar__link teacher-navbar__link--active"
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
import IconExamHub from '@/components/icons/IconExamHub.vue'
import { TEACHER_PROFILE } from '@/constants/teacher.constants'

const teacher = TEACHER_PROFILE
</script>

<style scoped src="@/assets/styles/layouts/teacher-layout.css"></style>
