import { defineStore } from 'pinia'
import { USER_ROLES } from '@/constants/auth.constants'
import { authService, hasStoredSession } from '@/services/authService'

let restorePromise = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    currentRole: USER_ROLES.STUDENT,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    session: ''
  }),

  getters: {
    // หมายเหตุ: getter ของ Pinia เรียกด้วย `this` เท่านั้น (ไม่มีพารามิเตอร์ getters
    // เหมือน Vuex) จึงต้องอ้าง getter อื่นผ่าน this.<ชื่อ getter>

    /** บัญชีผู้ดูแล: เข้าได้ทั้งฝั่งนักเรียนและฝั่งครู */
    isAdmin() {
      return this.user?.role === USER_ROLES.ADMIN
    },
    isStudent() {
      return this.isAdmin || this.currentRole === USER_ROLES.STUDENT
    },
    isTeacher() {
      return this.isAdmin || this.currentRole === USER_ROLES.TEACHER
    }
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

    /**
     * เปลี่ยนรหัสผ่านของบัญชีตัวเอง — ต้องยืนยันด้วยรหัสผ่านปัจจุบัน
     * (backend จะออก token ชุดใหม่ให้เครื่องนี้ และเพิกถอน session เครื่องอื่น)
     */
    async changePassword(payload) {
      const result = await authService.changePassword(payload)
      this.applySession(result.user)
      return result
    },

    /** กู้ session เดิมตอนเปิดแอป ถ้ามี token เก็บอยู่ (single-flight) */
    async restore() {
      if (this.isAuthenticated) return this.user
      if (!hasStoredSession()) {
        this.user = null
        this.isAuthenticated = false
        return null
      }
      if (restorePromise) return restorePromise

      restorePromise = (async () => {
        try {
          const user = await authService.me()
          this.applySession(user)
          return user
        } catch (err) {
          // ถ้าถูกปฏิเสธสิทธิ์ (401/403) ถือว่าเซสชันหมดอายุ
          if (err?.status === 401 || err?.status === 403) {
            this.user = null
            this.isAuthenticated = false
          }
          return null
        } finally {
          restorePromise = null
        }
      })()

      return restorePromise
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
        // กลับไปค่าเริ่มต้น เพื่อให้หน้า login แสดงแท็บนักเรียนเป็นค่าเริ่มต้น
        this.currentRole = USER_ROLES.STUDENT
      }
    }
  }
})
