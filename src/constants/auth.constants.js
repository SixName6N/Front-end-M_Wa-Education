export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  // เข้าได้ทั้งฝั่งนักเรียนและฝั่งครู (บัญชีผู้ดูแล/เดโม)
  ADMIN: 'admin'
}

export const ROLE_CONFIG = {
  [USER_ROLES.STUDENT]: {
    labelTh: 'นักเรียน (Student)',
    idLabelTh: 'รหัสนักเรียน หรือ อีเมลโรงเรียน',
    idLabelEn: 'Student ID',
    placeholder: 'เช่น 65030140 หรือ student@school.ac.th',
    registerText: 'ลงทะเบียนนักเรียนใหม่'
  },
  [USER_ROLES.TEACHER]: {
    labelTh: 'ครูผู้สอน (Teacher)',
    idLabelTh: 'รหัสประจำตัวครู หรือ อีเมลโรงเรียน',
    idLabelEn: 'Teacher ID',
    placeholder: 'เช่น 1002345 หรือ teacher@school.ac.th',
    registerText: 'ลงทะเบียนสำหรับอาจารย์/ผู้สอน'
  }
}

export const SSO_PROVIDERS = {
  GOOGLE: {
    id: 'google',
    name: 'Google Workspace for Education',
    enabled: true
  },
  DOPA: {
    id: 'dopa',
    name: 'ระบบพิสูจน์ตัวตนดิจิทัลภาครัฐ (D.DOPA)',
    enabled: true
  }
}

export const EXTERNAL_LINKS = {
  PRIVACY: '/privacy',
  TERMS: '/terms',
  HELP: '/help',
  EXAM_GUIDE: '/guide',
  FORGOT_PASSWORD: '/forgot-password',
  REGISTER: '/register',
  IT_HELPDESK: '/helpdesk'
}
