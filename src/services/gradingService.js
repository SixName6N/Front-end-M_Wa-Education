import { apiClient, API_BASE_URL, getAccessToken } from './apiClient'

/**
 * Service ฝั่งครูสำหรับตรวจข้อสอบและจัดการผลคะแนน
 * เชื่อมต่อกับ Backend REST API (/api/grading)
 */
export const gradingService = {
  /**
   * ดึงรายการส่งข้อสอบทั้งหมดของชุดข้อสอบ
   * @param {string} examId
   * @param {Object} [params] - { status?: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'RELEASED' }
   */
  async listExamSubmissions(examId, params = {}) {
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    const qs = query.toString() ? `?${query.toString()}` : ''
    const { data } = await apiClient.get(`/grading/exams/${examId}/submissions${qs}`)
    return data?.submissions ?? []
  },

  /**
   * ดึงรายละเอียดคำตอบทุกข้อของนักเรียน 1 คน เพื่อให้ครูตรวจ
   * @param {string} submissionId
   */
  async getSubmissionDetail(submissionId) {
    const { data } = await apiClient.get(`/grading/submissions/${submissionId}`)
    return data?.submission
  },

  /**
   * ครูตรวจข้อสอบอัตนัย 1 ข้อ (บันทึกคะแนน/ความคิดเห็น)
   * @param {string} answerId
   * @param {Object} payload - { isCorrect: boolean, awardedPoints?: number, graderComment?: string }
   */
  async gradeAnswer(answerId, payload) {
    const { data } = await apiClient.patch(`/grading/answers/${answerId}`, payload)
    return data?.submission
  },

  /**
   * ส่งผลตรวจให้นักเรียน 1 คน (เปลี่ยนสถานะเป็น RELEASED)
   * @param {string} submissionId
   */
  async releaseSubmission(submissionId) {
    const { data } = await apiClient.post(`/grading/submissions/${submissionId}/release`)
    return data?.submission
  },

  /**
   * ปล่อยผลสอบทั้งชุด (เฉพาะคนที่ตรวจครบแล้ว)
   * @param {string} examId
   */
  async releaseExamResults(examId) {
    const { data } = await apiClient.post(`/grading/exams/${examId}/release`)
    return data
  },

  /**
   * ส่งออกผลคะแนนทั้งชุดเป็น CSV
   * @param {string} examId
   * @param {Object} [params] - { status?: string, title?: string }
   */
  async exportExamResultsCsv(examId, { status, title = 'exam-results' } = {}) {
    const query = new URLSearchParams()
    if (status) query.set('status', status)
    const qs = query.toString() ? `?${query.toString()}` : ''
    const token = getAccessToken()
    const response = await fetch(`${API_BASE_URL}/grading/exams/${examId}/export${qs}`, {
      headers: (token ? { Authorization: `Bearer ${token}` } : {})
    })
    if (!response.ok) throw new Error('ไม่สามารถส่งออกผลคะแนนเป็น CSV ได้')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }
}
