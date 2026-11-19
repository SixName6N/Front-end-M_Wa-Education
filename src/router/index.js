import { createRouter, createWebHistory } from 'vue-router'
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
        title: 'เข้าสู่ระบบ (Login) - ExamHub'
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
        title: 'รายการข้อสอบของนักเรียน (Student Exam List) - ExamHub'
      }
    },
    {
      path: '/student/exams/:examId/take',
      name: 'student-exam-take',
      component: () => import('@/views/StudentExamTakingView.vue'),
      meta: {
        title: 'ห้องสอบ (Exam Room) - ExamHub'
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
        title: 'จัดการรายชื่อนักเรียน (Student Management) - ExamHub'
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
        title: 'สร้างและเพิ่มข้อสอบ (Teacher Exam Builder) - ExamHub'
      }
    },
    {
      path: '/teacher/exams',
      name: 'teacher-exam-bank',
      component: TeacherExamBankView,
      meta: {
        title: 'คลังข้อสอบ (Exam Bank) - ExamHub'
      }
    },
    {
      path: '/teacher/grading',
      name: 'teacher-grading',
      component: () => import('@/views/TeacherGradingView.vue'),
      meta: {
        title: 'ตรวจข้อสอบ (Grading & Assessment) - ExamHub'
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
        title: 'หน้าแรก - ExamHub'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue')
    },
    {
      // ต้องอยู่ท้ายสุดเสมอ: ดักทุก path ที่ไม่ตรงกับ route ด้านบน
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: 'ไม่พบหน้า (404) - ExamHub'
      }
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
})

export default router
