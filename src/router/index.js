import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import StudentExamListView from '@/views/StudentExamListView.vue'
import TeacherStudentManagementView from '@/views/TeacherStudentManagementView.vue'

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
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
