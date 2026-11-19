import { apiClient, API_BASE_URL, getAccessToken } from './apiClient'

/**
 * Service ฝั่งครูสำหรับจัดการห้องเรียนและรายชื่อนักเรียน
 * ทุกฟังก์ชันคุยกับ REST API จริง (ไม่ใช่ mock)
 */
export const studentService = {
  /** ห้องเรียนทั้งหมดของครูที่ล็อกอินอยู่ */
  async listClassrooms() {
    const { data } = await apiClient.get('/classrooms')
    return data?.classrooms ?? []
  },

  /** รายชื่อนักเรียนที่ลงทะเบียนในห้องเรียนหนึ่ง */
  async listClassroomStudents(classroomId) {
    const { data } = await apiClient.get(`/classrooms/${classroomId}/students`)
    return data?.students ?? []
  },

  /**
   * เพิ่มนักเรียนเข้าห้องเรียน
   * - ถ้ามีบัญชีอยู่แล้ว (อีเมล/รหัสตรงกัน) ระบบจะผูกเข้าห้องให้
   * - ถ้ายังไม่มีบัญชี ระบบจะสร้างบัญชีใหม่และคืน temporaryPassword กลับมา
   */
  async addStudentToClassroom(classroomId, { email, fullName, studentCode, password }) {
    const body = { email, fullName }
    if (studentCode) body.studentCode = studentCode
    if (password) body.password = password

    const { data } = await apiClient.post(`/classrooms/${classroomId}/students`, body)
    return data
  },

  /** เอานักเรียนออกจากห้องเรียน (บัญชีนักเรียนยังอยู่) */
  async removeStudentFromClassroom(classroomId, studentId) {
    const { data } = await apiClient.delete(
      `/classrooms/${classroomId}/students/${studentId}`
    )
    return data
  },

  /** ดาวน์โหลดแม่แบบ CSV สำหรับนำเข้ารายชื่อนักเรียน */
  async downloadTemplate() {
    const token = getAccessToken()
    const response = await fetch(`${API_BASE_URL}/students/template`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!response.ok) throw new Error('ไม่สามารถดาวน์โหลดแม่แบบได้')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_roster_template.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  },

  /** ส่งออกรายชื่อนักเรียนในห้องเรียนเป็น CSV */
  async exportClassroomStudentsCsv(classroomId, classroomName = 'classroom') {
    const token = getAccessToken()
    const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/students/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!response.ok) throw new Error('ไม่สามารถส่งออกรายชื่อนักเรียนได้')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${classroomName}-students.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  },

  /**
   * นำเข้ารายชื่อนักเรียนเข้าห้องเรียนจากไฟล์ CSV
   * @param {string} classroomId
   * @param {File} file
   */
  async importStudentsCsv(classroomId, file) {
    try {
      const token = getAccessToken()
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/students/import`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        const technicalDetail = payload?.error?.message || payload?.message || `HTTP ${response.status}`
        const err = new Error('นำเข้าข้อมูลไม่สำเร็จ')
        err.technical = technicalDetail
        throw err
      }
      return payload
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการนำเข้าไฟล์ CSV (Technical):', error.technical || error.message, error)
      throw error
    }
  }
}
