<template>
  <div class="student-layout">
    <!-- Student Header Navbar -->
    <header class="student-navbar">
      <div class="student-navbar__inner">
        <!-- Left: Logo & Menus -->
        <div class="student-navbar__left">
          <router-link to="/" class="student-navbar__brand">
            <div class="student-navbar__logo">
              <IconExamHub size="18" />
            </div>
            <span class="student-navbar__brand-name">ExamHub</span>
          </router-link>

          <nav class="student-navbar__menu">
            <router-link
              to="/student/exams"
              class="student-navbar__link student-navbar__link--active"
            >
              ข้อสอบของฉัน
            </router-link>
            <a href="#" class="student-navbar__link" @click.prevent>ประวัติการสอบ</a>
            <a href="#" class="student-navbar__link" @click.prevent>ตารางสอบ</a>
          </nav>
        </div>

        <!-- Right: Role badge, notifications, profile -->
        <div class="student-navbar__right">
          <span class="student-navbar__role-badge">นักเรียน</span>

          <button type="button" class="student-navbar__icon-btn" aria-label="แจ้งเตือน">
            <IconBell size="18" />
          </button>

          <div class="student-navbar__profile">
            <div class="student-navbar__user-info">
              <span class="student-navbar__user-name">{{ student.name }}</span>
              <span class="student-navbar__user-class">{{ student.classRoom }} เลขที่ {{ student.number }}</span>
            </div>
            <div class="student-navbar__avatar">
              <IconUser size="16" />
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="student-layout__main">
      <slot />
    </main>

    <!-- Global Footer -->
    <footer class="student-footer">
      <div class="student-footer__inner">
        <div class="student-footer__copyright">
          © 2025 ExamHub • ระบบคลังข้อสอบและตรวจข้อสอบออนไลน์
        </div>
        <div class="student-footer__links">
          <a href="#" class="student-footer__link" @click.prevent>ติดต่อฝ่ายสนับสนุนการศึกษา</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import IconExamHub from '@/components/icons/IconExamHub.vue'
import IconBell from '@/components/icons/IconBell.vue'
import IconUser from '@/components/icons/IconUser.vue'
import { STUDENT_PROFILE } from '@/constants/exam.constants'

const student = STUDENT_PROFILE
</script>

<style scoped src="@/assets/styles/layouts/student-layout.css"></style>
