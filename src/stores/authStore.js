import { defineStore } from 'pinia'
import { USER_ROLES } from '@/constants/auth.constants'
import { authService, clearStoredSession, hasStoredSession } from '@/services/authService'

/** สัญญาการกู้ session ที่กำลังทำอยู่ — กันเรียก restore() ซ้ำพร้อมกันแล้วยิง API ซ้ำ */
let restorePromise = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    currentRole: USER_ROLES.STUDENT,
    isAuthenticated: false,
    /** ตรวจ token ที่เก็บไว้แล้วหรือยัง (กัน guard เรียก /auth/me ซ้ำทุกครั้งที่เปลี่ยนหน้า) */
    sessionChecked: false,
    isLoading: false,
    error: null,
    session: 'Session 2/2568'
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
      this.sessionChecked = true
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
     * กู้ session เดิมตอนเปิดแอป ถ้ามี token เก็บอยู่
     * เรียกซ้ำได้ปลอดภัย: ตรวจครั้งเดียวต่ออายุแอป และรอ promise เดียวกันถ้าซ้อนกัน
     */
    async restore() {
      if (this.sessionChecked) return
      if (!hasStoredSession()) {
        this.sessionChecked = true
        return
      }
      if (!restorePromise) {
        restorePromise = (async () => {
          try {
            const user = await authService.me()
            this.applySession(user)
          } catch {
            // token หมดอายุ/ไม่ถูกต้อง — ล้างทิ้ง ถือว่ายังไม่ล็อกอิน
            clearStoredSession()
            this.user = null
            this.isAuthenticated = false
          } finally {
            this.sessionChecked = true
          }
        })()
      }
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

    /** ล้าง session ฝั่ง client ทันที (ไม่เรียก API) — ใช้เมื่อ token หมดอายุ/ถูกเพิกถอน */
    clearSession() {
      clearStoredSession()
      this.user = null
      this.isAuthenticated = false
      this.error = null
      this.sessionChecked = true
      restorePromise = null
      // กลับไปค่าเริ่มต้น เพื่อให้หน้า login แสดงแท็บนักเรียนเป็นค่าเริ่มต้น
      this.currentRole = USER_ROLES.STUDENT
    },

    async logout() {
      try {
        await authService.logout()
      } finally {
        this.clearSession()
      }
    }
  }
})
