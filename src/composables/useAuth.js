import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { validateIdentifier, validatePassword } from '@/utils/validators'

export function useAuth() {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  const form = reactive({
    identifier: '',
    password: '',
    rememberMe: false
  })

  const errors = reactive({
    identifier: '',
    password: ''
  })

  const isSubmitting = ref(false)
  const loginSuccessMessage = ref('')

  const handleRoleChange = (role) => {
    authStore.setRole(role)
    errors.identifier = ''
    errors.password = ''
  }

  const validateForm = () => {
    errors.identifier = validateIdentifier(form.identifier, authStore.currentRole)
    errors.password = validatePassword(form.password)
    return !errors.identifier && !errors.password
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    isSubmitting.value = true
    try {
      await authStore.login({
        identifier: form.identifier,
        password: form.password,
        rememberMe: form.rememberMe
      })
      loginSuccessMessage.value = 'เข้าสู่ระบบสำเร็จ กำลังนำท่านเข้าสู่ระบบ...'
      // ถ้ามาจากการถูกเด้งออก (มี ?redirect=) ให้กลับไปหน้าที่ตั้งใจไว้ก่อน
      // ไม่งั้นพาไปหน้าหลักตามบทบาท (router guard จะคอยกันสิทธิ์ให้อีกชั้น)
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
      const destination = redirect || (authStore.isTeacher ? '/teacher/students' : '/student/exams')
      setTimeout(() => {
        router.push(destination)
      }, 1000)
    } catch (err) {
      console.error(err)
    } finally {
      isSubmitting.value = false
    }
  }

  const handleSSO = async (provider) => {
    try {
      await authStore.ssoLogin(provider)
      alert(`กำลังเชื่อมต่อไปยัง ${provider === 'google' ? 'Google Workspace for Education' : 'ระบบดิจิทัลภาครัฐ (D.DOPA)'}`)
    } catch (err) {
      console.error(err)
    }
  }

  return {
    form,
    errors,
    authStore,
    isSubmitting,
    loginSuccessMessage,
    handleRoleChange,
    handleLogin,
    handleSSO
  }
}
