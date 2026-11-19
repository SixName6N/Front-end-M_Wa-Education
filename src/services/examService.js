import { apiClient, API_BASE_URL, getAccessToken, ApiError } from './apiClient'

/**
 * Service ฝั่งครูสำหรับจัดการคลังข้อสอบและชุดข้อสอบ
 * เชื่อมต่อกับ Backend REST API (/api/exams, /api/courses)
 */
export const examService = {
  /**
   * ดึงรายการชุดข้อสอบทั้งหมด
   * @param {Object} [params] - { status: 'DRAFT' | 'PUBLISHED' | 'CLOSED', courseId: string }
   */
  async listExams(params = {}) {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.courseId) query.set('courseId', params.courseId)

    const qs = query.toString() ? `?${query.toString()}` : ''
    const { data } = await apiClient.get(`/exams${qs}`)
    return data?.exams ?? []
  },

  /**
   * สร้างชุดข้อสอบใหม่
   * @param {Object} payload - { title, description, courseId, timeLimitMinutes, defaultDisplayMode, questionsPerPage }
   */
  async createExam(payload) {
    const { data } = await apiClient.post('/exams', payload)
    return data?.exam
  },

  /**
   * ดึงรายละเอียดชุดข้อสอบและคำถามทั้งหมด
   * @param {string} examId
   */
  async getExamDetail(examId) {
    const { data } = await apiClient.get(`/exams/${examId}`)
    return data?.exam
  },

  /**
   * อัปเดตข้อมูลชุดข้อสอบ
   * @param {string} examId
   * @param {Object} payload
   */
  async updateExam(examId, payload) {
    const { data } = await apiClient.patch(`/exams/${examId}`, payload)
    return data?.exam
  },

  /**
   * ลบชุดข้อสอบ
   * @param {string} examId
   * @param {Object} [options] - { force: boolean }
   */
  async deleteExam(examId, { force = false } = {}) {
    const { data } = await apiClient.delete(`/exams/${examId}?force=${force}`)
    return data
  },

  /**
   * เผยแพร่ชุดข้อสอบ (เปลี่ยนสถานะเป็น PUBLISHED)
   * @param {string} examId
   */
  async publishExam(examId) {
    const { data } = await apiClient.post(`/exams/${examId}/publish`)
    return data?.exam
  },

  /**
   * ปิดชุดข้อสอบ (เปลี่ยนสถานะเป็น CLOSED)
   * @param {string} examId
   */
  async closeExam(examId) {
    const { data } = await apiClient.post(`/exams/${examId}/close`)
    return data?.exam
  },

  /**
   * เพิ่มข้อสอบใหม่ในชุด
   * @param {string} examId
   * @param {Object} question - { type, prompt, points, order, referenceText, explanation, choices }
   */
  async addQuestion(examId, question) {
    const { data } = await apiClient.post(`/exams/${examId}/questions`, question)
    return data?.question
  },

  /**
   * แก้ไขคำถาม
   * @param {string} examId
   * @param {string} questionId
   * @param {Object} payload
   */
  async updateQuestion(examId, questionId, payload) {
    const { data } = await apiClient.patch(`/exams/${examId}/questions/${questionId}`, payload)
    return data?.question
  },

  /**
   * ลบข้อสอบ
   * @param {string} examId
   * @param {string} questionId
   */
  async deleteQuestion(examId, questionId) {
    const { data } = await apiClient.delete(`/exams/${examId}/questions/${questionId}`)
    return data
  },

  /**
   * สลับเรียงลำดับข้อสอบ
   * @param {string} examId
   * @param {Array<{ id: string, order: number }>} items
   */
  async reorderQuestions(examId, items) {
    const { data } = await apiClient.put(`/exams/${examId}/questions/order`, { items })
    return data?.questions
  },

  /**
   * ดึงเกณฑ์ตัดเกรดมาตรฐาน
   */
  async getDefaultCutoffs() {
    const { data } = await apiClient.get('/exams/default-cutoffs')
    return data?.cutoffs ?? []
  },

  /**
   * ดึง IP ปัจจุบันของผู้เรียก (ไว้ทำปุ่ม "ใช้ IP นี้" ในช่องจำกัด IP)
   * @returns {Promise<{ ip: string, normalizedIp: string|null, version: number|null }>}
   */
  async getRequestIp() {
    const { data } = await apiClient.get('/exams/request-ip')
    return data ?? { ip: '', normalizedIp: null, version: null }
  },

  /**
   * ดึงเกณฑ์ตัดเกรดของชุดข้อสอบ
   * @param {string} examId
   */
  async getCutoffs(examId) {
    const { data } = await apiClient.get(`/exams/${examId}/cutoffs`)
    return data?.cutoffs ?? []
  },

  /**
   * บันทึกเกณฑ์ตัดเกรด
   * @param {string} examId
   * @param {Array<{ grade: string, minPercent: number }>} cutoffs
   */
  async replaceCutoffs(examId, cutoffs) {
    const { data } = await apiClient.put(`/exams/${examId}/cutoffs`, { cutoffs })
    return data?.cutoffs
  },

  /**
   * มอบหมายข้อสอบให้ห้องเรียน
   * @param {string} examId
   * @param {Object} assignment - { classroomId, availableFrom, availableTo }
   */
  async assignClassroom(examId, assignment) {
    const { data } = await apiClient.post(`/exams/${examId}/assignments`, assignment)
    return data?.assignment
  },

  /**
   * ยกเลิกการมอบหมายข้อสอบให้ห้องเรียน
   * @param {string} examId
   * @param {string} assignmentId
   */
  async unassignClassroom(examId, assignmentId) {
    const { data } = await apiClient.delete(`/exams/${examId}/assignments/${assignmentId}`)
    return data
  },

  /**
   * ดึงรายวิชาทั้งหมดของครู
   */
  async listCourses() {
    const { data } = await apiClient.get('/courses')
    return data?.courses ?? []
  },

  /**
   * ดาวน์โหลดแม่แบบ CSV สำหรับนำเข้าข้อสอบ
   */
  async downloadQuestionTemplate() {
    const token = getAccessToken()
    const response = await fetch(`${API_BASE_URL}/exams/questions/import-template`, {
      headers: (token ? { Authorization: `Bearer ${token}` } : {})
    })
    if (!response.ok) throw new Error('ไม่สามารถดาวน์โหลดแม่แบบข้อสอบได้')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'question_import_template.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  },

  /**
   * นำเข้าข้อสอบจากไฟล์ CSV/.xlsx
   * @param {string} examId
   * @param {File} file
   * @param {Object} [options] - { dryRun?: boolean }
   * @returns {Promise<Object>} ผลลัพธ์จาก backend (dryRun จะได้ preview, นำเข้าจริงจะได้ questions)
   * @throws {ApiError} 400 พร้อม details = [{ row, message }] เมื่อไฟล์มีแถวผิด
   */
  async importQuestionsFromFile(examId, file, { dryRun = false } = {}) {
    const token = getAccessToken()
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(
      `${API_BASE_URL}/exams/${examId}/questions/import?dryRun=${dryRun}`,
      {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      }
    )
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      const error = payload?.error ?? {}
      throw new ApiError(error.message || 'นำเข้าข้อสอบจากไฟล์ไม่สำเร็จ', {
        status: response.status,
        code: error.code ?? null,
        details: error.details ?? null
      })
    }
    return payload
  }
}
