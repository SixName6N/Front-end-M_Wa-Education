import { apiClient } from './apiClient'

/**
 * Service ฝั่งนักเรียนสำหรับดูข้อสอบ ทำข้อสอบ และดูผลคะแนน
 * เชื่อมต่อกับ Backend REST API (/api/my/*)
 */
export const studentExamService = {
  /**
   * ดึงรายการห้องเรียนที่นักเรียนเข้าร่วมอยู่
   * @returns {Promise<Array>} รายการห้องเรียน
   */
  async listMyClassrooms() {
    const { data } = await apiClient.get('/my/classrooms')
    return data?.classrooms ?? []
  },

  /**
   * ดึงรายการข้อสอบทั้งหมดที่นักเรียนสามารถเข้าทำได้
   * @returns {Promise<Array>} รายการข้อสอบ
   */
  async listMyExams() {
    const { data } = await apiClient.get('/my/exams')
    return data?.exams ?? []
  },

  /**
   * ดึงรายละเอียดข้อสอบ (ก่อนเริ่มทำ)
   * @param {string} examId - รหัสชุดข้อสอบ
   * @returns {Promise<Object>} รายละเอียดข้อสอบ
   */
  async getExamDetail(examId) {
    const { data } = await apiClient.get(`/my/exams/${examId}`)
    return data?.exam
  },

  /**
   * เริ่มทำข้อสอบ (สร้าง submission ใหม่)
   * @param {string} examId - รหัสชุดข้อสอบ
   * @param {Object} [options] - { displayMode?: string }
   * @returns {Promise<Object>} ข้อมูล submission ที่สร้างขึ้น
   */
  async startSubmission(examId, { displayMode } = {}) {
    const body = {}
    if (displayMode) body.displayMode = displayMode
    const { data } = await apiClient.post(`/my/exams/${examId}/submissions`, body)
    return data?.submission
  },

  /**
   * ดึงข้อมูล submission ระหว่างทำข้อสอบ
   * @param {string} submissionId - รหัส submission
   * @returns {Promise<Object>} ข้อมูล submission
   */
  async getSubmission(submissionId) {
    const { data } = await apiClient.get(`/my/submissions/${submissionId}`)
    return data?.submission
  },

  /**
   * บันทึกคำตอบ (auto-save ระหว่างทำ)
   * @param {string} submissionId - รหัส submission
   * @param {Array<{ questionId: string, choiceId?: string, textAnswer?: string }>} answers - รายการคำตอบ
   * @returns {Promise<Object>} ข้อมูลที่บันทึกสำเร็จ
   */
  async saveAnswers(submissionId, answers) {
    const { data } = await apiClient.put(`/my/submissions/${submissionId}/answers`, { answers })
    return data
  },

  /**
   * ส่งข้อสอบ (ยืนยันการส่ง)
   * @param {string} submissionId - รหัส submission
   * @param {Object} [options] - { displayMode?: string }
   * @returns {Promise<Object>} ข้อมูล submission ที่ส่งแล้ว
   */
  async submitSubmission(submissionId, { displayMode } = {}) {
    const body = {}
    if (displayMode) body.displayMode = displayMode
    const { data } = await apiClient.post(`/my/submissions/${submissionId}/submit`, body)
    return data?.submission
  },

  /**
   * ดึงรายการผลสอบทั้งหมดของนักเรียน
   * @param {Object} [params] - { examId?: string } กรองตามชุดข้อสอบ
   * @returns {Promise<Array>} รายการผลสอบ
   */
  async listMyResults({ examId } = {}) {
    const query = new URLSearchParams()
    if (examId) query.set('examId', examId)
    const qs = query.toString() ? `?${query.toString()}` : ''
    const { data } = await apiClient.get(`/my/results${qs}`)
    return data?.results ?? []
  },

  /**
   * ดึงรายละเอียดผลสอบของ submission
   * @param {string} submissionId - รหัส submission
   * @returns {Promise<Object>} ผลสอบ
   */
  async getResult(submissionId) {
    const { data } = await apiClient.get(`/my/results/${submissionId}`)
    return data?.result
  }
}
