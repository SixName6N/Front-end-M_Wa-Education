import { defineStore } from 'pinia'
import { USER_ROLES } from '@/constants/auth.constants'
import { authService, hasStoredSession } from '@/services/authService'

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

    /** ตั้ง session จาก user ที่ได้จาก API */
    applySession(user) {
      this.user = user
      this.isAuthenticated = true
      if (user?.role) this.currentRole = user.role
    },

    async login(credentials) {
      this.isLoading = true
      this.error = null
      try {
        const result = await authService.login({
          ...credentials,
          role: this.currentRole
        })
        this.applySession(result.user)
        return result
      } catch (err) {
        this.error = err.message || 'การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูลอีกครั้ง'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /** กู้ session เดิมตอนเปิดแอป ถ้ามี token เก็บอยู่ */
    async restore() {
      if (this.isAuthenticated || !hasStoredSession()) return
      try {
        const user = await authService.me()
        this.applySession(user)
      } catch {
        // token หมดอายุ/ไม่ถูกต้อง — ถือว่ายังไม่ล็อกอิน
        this.user = null
        this.isAuthenticated = false
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

    async logout() {
      try {
        await authService.logout()
      } finally {
        this.user = null
        this.isAuthenticated = false
        this.error = null
      }
    }
  }
})
