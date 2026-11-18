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

          <!-- Profile with Dropdown Popup -->
          <div class="student-navbar__profile" ref="profileRef">
            <button
              type="button"
              class="student-navbar__profile-btn"
              :class="{ 'student-navbar__profile-btn--active': isMenuOpen }"
              aria-label="เมนูโปรไฟล์นักเรียน"
              @click="isMenuOpen = !isMenuOpen"
            >
              <div class="student-navbar__user-info">
                <span class="student-navbar__user-name">{{ displayName }}</span>
                <span class="student-navbar__user-class">{{ studentClassInfo }}</span>
              </div>
              <div class="student-navbar__avatar">
                <IconUser size="16" />
              </div>
              <span
                class="material-symbols-outlined student-navbar__chevron"
                :class="{ 'student-navbar__chevron--open': isMenuOpen }"
              >
                expand_more
              </span>
            </button>

            <!-- Popup Menu -->
            <div v-if="isMenuOpen" class="student-profile-dropdown">
              <div class="student-profile-dropdown__header">
                <div class="student-profile-dropdown__avatar">
                  <IconUser size="18" />
                </div>
                <div class="student-profile-dropdown__info">
                  <div class="student-profile-dropdown__name">{{ fullName }}</div>
                  <div class="student-profile-dropdown__role">นักเรียน • {{ studentClassInfo }}</div>
                </div>
              </div>

              <div class="student-profile-dropdown__divider"></div>

              <div class="student-profile-dropdown__menu">
                <button
                  type="button"
                  class="student-profile-dropdown__item student-profile-dropdown__item--danger"
                  @click="handleLogout"
                >
                  <span class="material-symbols-outlined text-[18px]">logout</span>
                  <span>ออกจากระบบ</span>
                </button>
              </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import IconExamHub from '@/components/icons/IconExamHub.vue'
import IconBell from '@/components/icons/IconBell.vue'
import IconUser from '@/components/icons/IconUser.vue'
import { STUDENT_PROFILE } from '@/constants/exam.constants'

const router = useRouter()
const authStore = useAuthStore()
const student = STUDENT_PROFILE

// Profile dropdown state
const profileRef = ref(null)
const isMenuOpen = ref(false)

const displayName = computed(() => {
  return authStore.user?.fullName || authStore.user?.name || student.name
})

const fullName = computed(() => {
  return authStore.user?.fullName || authStore.user?.name || student.name
})

const studentClassInfo = computed(() => {
  return `${student.classRoom} เลขที่ ${student.number}`
})

const handleClickOutside = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    isMenuOpen.value = false
  }
}

const handleLogout = async () => {
  isMenuOpen.value = false
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped src="@/assets/styles/layouts/student-layout.css"></style>
