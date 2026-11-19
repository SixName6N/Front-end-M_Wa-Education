import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import LoginView from '@/views/LoginView.vue'
import StudentExamListView from '@/views/StudentExamListView.vue'
import TeacherStudentManagementView from '@/views/TeacherStudentManagementView.vue'
import TeacherExamBuilderView from '@/views/TeacherExamBuilderView.vue'
import TeacherExamBankView from '@/views/TeacherExamBankView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: {
        title: 'เข้าสู่ระบบ (Login) - ExamHub',
        // เปิดให้คนทั่วไปเข้าได้ (หน้านี้คือประตูทางเข้า)
        public: true
      }
    },
    {
      path: '/login',
      redirect: '/'
    },
    {
      path: '/student/exams',
      name: 'student-exams',
      component: StudentExamListView,
      meta: {
        title: 'รายการข้อสอบของนักเรียน (Student Exam List) - ExamHub',
        requiresAuth: true,
        role: 'student'
      }
    },
    {
      path: '/student/exams/:examId/take',
      name: 'student-exam-take',
      component: () => import('@/views/StudentExamTakingView.vue'),
      meta: {
        title: 'ห้องสอบ (Exam Room) - ExamHub',
        requiresAuth: true,
        role: 'student'
      }
    },
    {
      path: '/exams',
      redirect: '/student/exams'
    },
    {
      path: '/teacher/students',
      name: 'teacher-students',
      component: TeacherStudentManagementView,
      meta: {
        title: 'จัดการรายชื่อนักเรียน (Student Management) - ExamHub',
        requiresAuth: true,
        role: 'teacher'
      }
    },
    {
      path: '/teacher/studentsList',
      redirect: '/teacher/students'
    },
    {
      path: '/teacher/exams/create',
      name: 'teacher-exam-create',
      component: TeacherExamBuilderView,
      meta: {
        title: 'สร้างและเพิ่มข้อสอบ (Teacher Exam Builder) - ExamHub',
        requiresAuth: true,
        role: 'teacher'
      }
    },
    {
      path: '/teacher/exams',
      name: 'teacher-exam-bank',
      component: TeacherExamBankView,
      meta: {
        title: 'คลังข้อสอบ (Exam Bank) - ExamHub',
        requiresAuth: true,
        role: 'teacher'
      }
    },
    {
      path: '/teacher/grading',
      name: 'teacher-grading',
      component: () => import('@/views/TeacherGradingView.vue'),
      meta: {
        title: 'ตรวจข้อสอบ (Grading & Assessment) - ExamHub',
        requiresAuth: true,
        role: 'teacher'
      }
    },
    {
      path: '/teacher/exam-bank',
      redirect: '/teacher/exams'
    },
    {
      path: '/teacher/exam-builder',
      redirect: '/teacher/exams/create'
    },
    {
      path: '/teacher',
      redirect: '/teacher/students'
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: 'หน้าแรก - ExamHub',
        requiresAuth: true
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: {
        public: true
      }
    },
    {
      // ต้องอยู่ท้ายสุดเสมอ: ดักทุก path ที่ไม่ตรงกับ route ด้านบน
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: 'ไม่พบหน้า (404) - ExamHub',
        public: true
      }
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

/** หน้าที่ควรพาผู้ใช้ที่ล็อกอินแล้วไป เมื่อพยายามเข้า/กลับไปหน้า login */
function homeRouteFor(authStore) {
  return authStore.isTeacher ? { name: 'teacher-students' } : { name: 'student-exams' }
}

/**
 * Middleware กลาง: บังคับสิทธิ์การเข้าถึงทุก route
 * - ยังไม่ล็อกอิน + หน้าไม่ใช่ public → เด้งไปหน้า login (จำปลายทางไว้ใน ?redirect=)
 * - ล็อกอินแล้ว + เข้าหน้า login → เด้งไปหน้าหลักตามบทบาท (ไม่ให้เห็นหน้า login ซ้ำ)
 * - บทบาทไม่ตรง (student/teacher) → เด้งไปหน้าหลักของบทบาทตัวเอง
 */
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // รอให้การกู้ session เดิมเสร็จก่อนตัดสินสิทธิ์ (กันกด refresh แล้วถูกเด้งออกทั้งที่ยังมี token)
  await authStore.restore()

  if (to.meta.title) {
    document.title = to.meta.title
  }

  // ล็อกอินค้างอยู่ ไม่ต้องกลับไปหน้า login
  if (to.name === 'login' && authStore.isAuthenticated) {
    return homeRouteFor(authStore)
  }

  // หน้าที่เปิดให้คนทั่วไปเข้าได้ (login / about / 404)
  if (to.meta.public === true) {
    return
  }

  // ยังไม่ล็อกอิน ห้ามเข้าทุกหน้า — เด้งไป login พร้อมจำปลายทางเดิมไว้
  if (!authStore.isAuthenticated) {
    return {
      name: 'login',
      query: to.fullPath && to.fullPath !== '/' ? { redirect: to.fullPath } : {}
    }
  }

  // บทบาทไม่ตรงกับที่หน้านั้นกำหนด (ADMIN เข้าได้ทั้งสองฝั่ง)
  if (to.meta.role === 'student' && !authStore.isStudent) {
    return homeRouteFor(authStore)
  }
  if (to.meta.role === 'teacher' && !authStore.isTeacher) {
    return homeRouteFor(authStore)
  }
})

export default router
