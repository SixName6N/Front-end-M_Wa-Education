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

async function request(method, endpoint, data) {
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
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, data) => request('POST', endpoint, data),
  put: (endpoint, data) => request('PUT', endpoint, data),
  patch: (endpoint, data) => request('PATCH', endpoint, data),
  delete: (endpoint) => request('DELETE', endpoint)
}
