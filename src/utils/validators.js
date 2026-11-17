/**
 * Validator utilities for login form
 */
export function validateIdentifier(value, role = 'student') {
  if (!value || !value.trim()) {
    return role === 'student'
      ? 'กรุณากรอกรหัสนักเรียน หรือ อีเมลโรงเรียน'
      : 'กรุณากรอกรหัสประจำตัวครู หรือ อีเมลโรงเรียน'
  }
  return ''
}

export function validatePassword(value) {
  if (!value) {
    return 'กรุณากรอกรหัสผ่าน'
  }
  if (value.length < 6) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
  }
  return ''
}
