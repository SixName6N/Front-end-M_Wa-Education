import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { validateIdentifier, validatePassword } from '@/utils/validators'

export function useAuth() {
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
      setTimeout(() => {
        router.push('/student/exams')
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
