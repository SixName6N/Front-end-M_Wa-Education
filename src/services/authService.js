import { apiClient, clearTokens, getAccessToken, getRefreshToken, setTokens } from './apiClient'

/** role ฝั่ง frontend เป็นตัวพิมพ์เล็ก แต่ API ต้องการตัวพิมพ์ใหญ่ */
const API_ROLE = {
  student: 'STUDENT',
  teacher: 'TEACHER'
}

/** แปลง user ที่ได้จาก API ให้เป็นรูปที่ UI ใช้ (fullName → name, role → ตัวพิมพ์เล็ก) */
function toUiUser(user) {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: String(user.role || '').toLowerCase(),
    studentCode: user.studentCode ?? null
  }
}

export const authService = {
  /**
   * เข้าสู่ระบบด้วย identifier (อีเมล) + รหัสผ่าน
   * API ยืนยันตัวตนด้วยอีเมล จึงส่ง identifier ไปเป็น email
   */
  async login({ identifier, password, role }) {
    const { data } = await apiClient.post('/auth/login', {
      email: String(identifier || '').trim(),
      password,
      role: API_ROLE[role] || String(role || '').toUpperCase()
    })

    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })

    return {
      success: true,
      user: toUiUser(data.user),
      token: data.accessToken
    }
  },

  /** ดึงข้อมูลผู้ใช้ปัจจุบันด้วย access token ที่เก็บไว้ */
  async me() {
    const { data } = await apiClient.get('/auth/me')
    return toUiUser(data.user)
  },

  /** ต่ออายุ session ด้วย refresh token ที่เก็บไว้ (token ถูก rotate) */
  async refresh() {
    const refreshToken = getRefreshToken()
    if (!refreshToken) throw new Error('ไม่มี refresh token')
    const { data } = await apiClient.post('/auth/refresh', { refreshToken })
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    return toUiUser(data.user)
  },

  /** ออกจากระบบ — เพิกถอน refresh token ฝั่ง server แล้วล้าง token ในเครื่อง */
  async logout() {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) await apiClient.post('/auth/logout', { refreshToken })
    } catch {
      // เพิกถอนฝั่ง server ไม่สำเร็จก็ยังล้าง token ในเครื่อง
    } finally {
      clearTokens()
    }
    return { success: true }
  },

  /**
   * SSO (Google / DOPA) — backend ยังไม่มี endpoint SSO
   * จึงคงเป็น stub ฝั่ง client ไว้ก่อนจนกว่า API จะรองรับ
   */
  async ssoLogin(provider) {
    return { success: true, provider, redirectUrl: `/auth/callback/${provider}` }
  }
}

/** มี token เก็บอยู่ในเครื่องหรือไม่ (ใช้ตอน restore session) */
export function hasStoredSession() {
  return Boolean(getAccessToken() || getRefreshToken())
}
