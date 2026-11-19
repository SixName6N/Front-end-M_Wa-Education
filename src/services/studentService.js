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

  /**
   * เปิด/ระงับการใช้งานบัญชีนักเรียน (PATCH /students/:studentId)
   * - ระงับ = isActive false → ล็อกอินไม่ได้ทุกห้องเรียน (ข้อมูลเดิมยังอยู่)
   * - เปิดใช้งาน = isActive true
   */
  async updateStudentStatus(studentId, isActive) {
    const { data } = await apiClient.patch(`/students/${studentId}`, { isActive })
    return data?.student ?? null
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
  }
}
