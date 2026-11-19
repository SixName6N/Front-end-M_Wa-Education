/**
 * HTTP Client — คุยกับ REST API จริง (Express + Prisma backend)
 *
 * Base URL อ่านจาก VITE_API_BASE_URL (ดู .env.local) ถ้าไม่ตั้งจะใช้
 * http://localhost:4000/api (backend โหมด dev)
 *
 * access/refresh token เก็บใน localStorage เพื่อให้ session อยู่ต่อหลัง refresh หน้า
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
).replace(/\/+$/, '')

const ACCESS_TOKEN_KEY = 'examhub.accessToken'
const REFRESH_TOKEN_KEY = 'examhub.refreshToken'

/** Error ที่พก status/code จาก backend มาด้วย เพื่อให้ UI แสดงข้อความไทยได้ตรง */
export class ApiError extends Error {
  constructor(message, { status = 0, code = null, details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens({ accessToken, refreshToken } = {}) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

function parseJson(text) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

let refreshPromise = null

async function requestRefreshToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearTokens()
    throw new ApiError('ไม่มี refresh token สำหรับต่ออายุเซสชัน', {
      status: 401,
      code: 'NO_REFRESH_TOKEN'
    })
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })

    const payload = parseJson(await res.text())
    if (!res.ok) {
      const error = payload?.error ?? {}
      const isTokenRejected =
        res.status === 401 ||
        res.status === 403 ||
        error.code === 'REFRESH_EXPIRED' ||
        error.code === 'INVALID_TOKEN'

      // ล้าง token เฉพาะกรณีที่ backend ปฏิเสธ token จริงๆ (401/403/invalid)
      // หากเกิด 5xx (เซิร์ฟเวอร์ error) จะไม่ล้าง token เพื่อให้ผู้ใช้สามารถ retry ได้
      if (isTokenRejected) {
        clearTokens()
        throw new ApiError(error.message || 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', {
          status: res.status,
          code: error.code || 'REFRESH_EXPIRED',
          details: error.details ?? null
        })
      }

      if (res.status >= 500) {
        throw new ApiError('เซิร์ฟเวอร์ขัดข้องชั่วคราว ไม่สามารถต่ออายุเซสชันได้ กรุณาลองใหม่อีกครั้ง', {
          status: res.status,
          code: 'SERVER_ERROR',
          details: error.details ?? null
        })
      }

      throw new ApiError(error.message || 'ไม่สามารถต่ออายุเซสชันได้', {
        status: res.status,
        code: error.code ?? null,
        details: error.details ?? null
      })
    }

    setTokens({ accessToken: payload.accessToken, refreshToken: payload.refreshToken })
    return payload.accessToken
  } catch (err) {
    // ล้าง token เฉพาะกรณีที่ backend ปฏิเสธ refresh token (เช่น 401, 403 หรือ REFRESH_EXPIRED)
    // แต่ถ้าเป็น network error ชั่วคราว จะไม่ล้าง token เพื่อให้ลองใหม่เมื่อต่อเน็ตได้
    if (err?.status === 401 || err?.status === 403 || err?.code === 'REFRESH_EXPIRED') {
      clearTokens()
    }
    throw err
  }
}

export async function getRefreshedToken() {
  if (!refreshPromise) {
    refreshPromise = requestRefreshToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

async function request(method, endpoint, data, { retry = true } = {}) {
  const headers = { Accept: 'application/json' }
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let body
  if (data !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(data)
  }

  let response
  try {
    const options = { method, headers }
    if (body !== undefined) options.body = body
    response = await fetch(`${API_BASE_URL}${endpoint}`, options)
  } catch (cause) {
    throw new ApiError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่', {
      status: 0,
      code: 'NETWORK_ERROR',
      details: cause
    })
  }

  // ดักจับ 401 เพื่อทำ single-flight refresh และลองส่งคำขอเดิมอีก 1 ครั้ง
  // ยกเว้นเฉพาะ login และ refresh เอง เพื่อป้องกัน loop แต่ /auth/me สามารถ refresh ได้
  const isAuthNoRetry = endpoint === '/auth/login' || endpoint === '/auth/refresh'
  if (response.status === 401 && retry && !isAuthNoRetry) {
    try {
      await getRefreshedToken()
      return await request(method, endpoint, data, { retry: false })
    } catch (refreshErr) {
      throw refreshErr instanceof ApiError
        ? refreshErr
        : new ApiError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', {
            status: 401,
            code: 'SESSION_EXPIRED',
            details: refreshErr
          })
    }
  }

  const payload = parseJson(await response.text())

  if (!response.ok) {
    const error = payload?.error ?? {}
    throw new ApiError(error.message || `คำขอล้มเหลว (HTTP ${response.status})`, {
      status: response.status,
      code: error.code ?? null,
      details: error.details ?? null
    })
  }

  return { data: payload, status: response.status }
}

export const apiClient = {
  get: (endpoint, options) => request('GET', endpoint, undefined, options),
  post: (endpoint, data, options) => request('POST', endpoint, data, options),
  put: (endpoint, data, options) => request('PUT', endpoint, data, options),
  patch: (endpoint, data, options) => request('PATCH', endpoint, data, options),
  delete: (endpoint, options) => request('DELETE', endpoint, undefined, options)
}
