<template>
  <div class="teacher-layout">
    <!-- Teacher Navbar -->
    <header class="teacher-navbar">
      <div class="teacher-navbar__inner">
        <!-- Left: Logo & Navigation Menu -->
        <div class="teacher-navbar__left">
          <router-link to="/teacher/exams/" class="teacher-navbar__brand">
            <div class="teacher-navbar__logo">
              <IconExamHub size="18" />
            </div>
            <span>ExamHub</span>
          </router-link>

          <nav class="teacher-navbar__nav">
            <router-link
              to="/teacher/exams/"
              class="teacher-navbar__link"
              :class="{ 'teacher-navbar__link--active': isExamsActive }"
            >
              คลังข้อสอบ
            </router-link>
            <router-link
              to="/teacher/grading"
              class="teacher-navbar__link"
              :class="{ 'teacher-navbar__link--active': isGradingActive }"
            >
              ตรวจข้อสอบ
            </router-link>
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
            <span>{{ authStore.isAdmin ? 'ผู้ดูแลระบบ' : 'ครูผู้สอน' }}</span>
            <router-link
              v-if="authStore.isAdmin"
              to="/student/exams"
              class="teacher-navbar__role-link"
            >
              สลับเป็นมุมมองนักเรียน
            </router-link>
          </div>

          <div class="teacher-navbar__divider"></div>

          <!-- Teacher Profile with Dropdown Popup -->
          <div class="teacher-navbar__profile" ref="profileRef">
            <button
              type="button"
              class="teacher-navbar__profile-btn"
              :class="{ 'teacher-navbar__profile-btn--active': isMenuOpen }"
              aria-label="เมนูโปรไฟล์"
              @click="isMenuOpen = !isMenuOpen"
            >
              <div class="teacher-navbar__avatar">
                <span>ครู</span>
              </div>
              <span class="teacher-navbar__teacher-name">{{ displayName }}</span>
              <span
                class="material-symbols-outlined teacher-navbar__chevron"
                :class="{ 'teacher-navbar__chevron--open': isMenuOpen }"
              >
                expand_more
              </span>
            </button>

            <!-- Popup Menu -->
            <div v-if="isMenuOpen" class="teacher-profile-dropdown">
              <div class="teacher-profile-dropdown__header">
                <div class="teacher-profile-dropdown__avatar">
                  <span>ครู</span>
                </div>
                <div class="teacher-profile-dropdown__info">
                  <div class="teacher-profile-dropdown__name">{{ fullName }}</div>
                  <div class="teacher-profile-dropdown__role">
                    ครูผู้สอน<template v-if="academicSession"> • {{ academicSession }}</template>
                  </div>
                </div>
              </div>

              <div class="teacher-profile-dropdown__divider"></div>

              <div class="teacher-profile-dropdown__menu">
                <button
                  type="button"
                  class="teacher-profile-dropdown__item teacher-profile-dropdown__item--danger"
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

    <!-- Mobile Sub-navigation Bar (Visible on screens <= 768px) -->
    <nav class="teacher-mobile-nav" aria-label="เมนูหลักครูผู้สอน">
      <router-link
        to="/teacher/exams/"
        class="teacher-mobile-nav__link"
        :class="{ 'teacher-mobile-nav__link--active': isExamsActive }"
      >
        <span class="material-symbols-outlined text-[18px]">folder_open</span>
        <span>คลังข้อสอบ</span>
      </router-link>
      <router-link
        to="/teacher/grading"
        class="teacher-mobile-nav__link"
        :class="{ 'teacher-mobile-nav__link--active': isGradingActive }"
      >
        <span class="material-symbols-outlined text-[18px]">fact_check</span>
        <span>ตรวจข้อสอบ</span>
      </router-link>
      <router-link
        to="/teacher/students"
        class="teacher-mobile-nav__link"
        :class="{ 'teacher-mobile-nav__link--active': isStudentsActive }"
      >
        <span class="material-symbols-outlined text-[18px]">group</span>
        <span>รายชื่อนักเรียน</span>
      </router-link>
    </nav>

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
          <span>อาจารย์ผู้สอน: {{ fullName }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import IconExamHub from '@/components/icons/IconExamHub.vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Profile dropdown state
const profileRef = ref(null)
const isMenuOpen = ref(false)

const displayName = computed(() => {
  return authStore.user?.fullName || authStore.user?.name || authStore.user?.email || 'ครูผู้สอน'
})

const fullName = computed(() => {
  return authStore.user?.fullName || authStore.user?.name || authStore.user?.email || 'ครูผู้สอน'
})

const academicSession = computed(() => {
  return authStore.user?.academicSession || ''
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

const isExamsActive = computed(() => {
  if (route && route.query && route.query.filter) return false
  return props.activeTab === 'exams' || (route && route.path && route.path.startsWith('/teacher/exam'))
})

const isGradingActive = computed(() => {
  return props.activeTab === 'grading' || (route && route.path && route.path.startsWith('/teacher/grading')) || (route && route.query && route.query.filter === 'review')
})

const isStudentsActive = computed(() => {
  if (props.activeTab === 'students') return true
  if (props.activeTab === 'exams') return false
  return !route || !route.path || route.path.startsWith('/teacher/student') || route.path === '/teacher'
})
</script>

<style scoped src="@/assets/styles/layouts/teacher-layout.css"></style>
