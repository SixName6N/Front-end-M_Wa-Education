import { apiClient } from './apiClient'

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
  }
}
