import { defineStore } from 'pinia'
import { USER_ROLES } from '@/constants/auth.constants'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    currentRole: USER_ROLES.STUDENT,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    session: 'Session 2/2568'
  }),

  getters: {
    isStudent: (state) => state.currentRole === USER_ROLES.STUDENT,
    isTeacher: (state) => state.currentRole === USER_ROLES.TEACHER
  },

  actions: {
    setRole(role) {
      if (Object.values(USER_ROLES).includes(role)) {
        this.currentRole = role
        this.error = null
      }
    },

    async login(credentials) {
      this.isLoading = true
      this.error = null
      try {
        const result = await authService.login({
          ...credentials,
          role: this.currentRole
        })
        this.user = result.user
        this.isAuthenticated = true
        return result
      } catch (err) {
        this.error = err.message || 'การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูลอีกครั้ง'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async ssoLogin(provider) {
      this.isLoading = true
      this.error = null
      try {
        const result = await authService.ssoLogin(provider)
        return result
      } catch (err) {
        this.error = err.message || 'ไม่สามารถเชื่อมต่อระบบยืนยันตัวตนได้'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      this.error = null
    }
  }
})
