export const STUDENT_PROFILE = {
  name: 'ด.ช. กิตติพงษ์ เจริญทรัพย์',
  classRoom: 'ม.3/1',
  number: '1',
  fullNameWithClass: 'สวัสดี กิตติพงษ์ (ม.3/1 เลขที่ 1)',
  role: 'นักเรียน',
  academicSession: 'ระบบพร้อมใช้งาน • ภาคเรียนที่ 1/2568'
}

export const EXAM_STATS = {
  open: 2,
  upcoming: 1,
  completed: 3
}

export const FILTER_OPTIONS = [
  { id: 'all', label: 'ทั้งหมด', count: 6 },
  { id: 'open', label: 'เปิดสอบอยู่', count: 2 },
  { id: 'upcoming', label: 'เร็วๆ นี้', count: 1 },
  { id: 'completed', label: 'สอบแล้ว', count: 3 }
]

export const OPEN_EXAMS = [
  {
    id: 'exam-1',
    code: 'ว23101',
    subject: 'วิทยาศาสตร์',
    type: 'open',
    statusText: 'เปิดให้ทำแล้ว',
    title: 'แบบทดสอบวัดผลกลางภาค: วิทยาศาสตร์และเทคโนโลยี',
    teacher: 'ครู อ.กมลทิพย์ วิทยาศาสตร์',
    department: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
    duration: '60 นาที',
    questions: '10 ข้อ',
    maxScore: '30 คะแนน',
    deadline: 'กำหนดส่ง: วันนี้ เวลา 16:30 น.',
    tagText: 'เหลือเวลาอีก 2 ชม.',
    tagVariant: 'warning',
    footerNote: 'บันทึกคำตอบอัตโนมัติตลอดการสอบ',
    buttonText: 'เข้าสู่ห้องสอบ (Start Exam)',
    isUrgent: true
  },
  {
    id: 'exam-2',
    code: 'ค23101',
    subject: 'คณิตศาสตร์',
    type: 'open',
    statusText: 'เปิดให้ทำแล้ว',
    title: 'แบบทดสอบย่อยบทที่ 3: ระบบสมการเชิงเส้นสองตัวแปร',
    teacher: 'ครู อ.สมชาย คณิตศาสตร์',
    department: 'กลุ่มสาระการเรียนรู้คณิตศาสตร์',
    duration: '45 นาที',
    questions: '15 ข้อ',
    maxScore: '20 คะแนน',
    deadline: 'กำหนดส่ง: พรุ่งนี้ 24 ก.ย. เวลา 18:00 น.',
    tagText: 'ปรนัย 15 ข้อ',
    tagVariant: 'neutral',
    footerNote: 'ทำได้ 1 ครั้ง (Single attempt)',
    buttonText: 'เข้าสู่ห้องสอบ'
  }
]

export const UPCOMING_EXAMS = [
  {
    id: 'exam-3',
    code: 'อ23101',
    subject: 'ภาษาอังกฤษ',
    type: 'upcoming',
    statusText: 'เปิดสอบพรุ่งนี้ 09:00 น.',
    title: 'Reading Comprehension & Grammar Quiz 2',
    teacher: 'Teacher David Miller',
    department: 'กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ',
    duration: '50 นาที',
    questions: '25 ข้อ',
    maxScore: '25 คะแนน',
    deadline: 'กำหนดเปิด: 25 ก.ย. 2568 เวลา 09:00 - 10:00 น.',
    tagText: 'เตรียมอุปกรณ์หูฟัง',
    tagVariant: 'neutral',
    footerNote: 'ปลดล็อคอัตโนมัติตามเวลา',
    buttonText: 'ยังไม่ถึงเวลาสอบ (ล็อค)',
    locked: true
  }
]

export const COMPLETED_EXAMS = [
  {
    id: 'exam-4',
    code: 'ส23101',
    subject: 'สังคมศึกษา',
    type: 'completed',
    statusText: 'ตรวจและเรียนร้อย',
    title: 'แบบทดสอบเก็บคะแนน: ประวัติศาสตร์ไทยสมัยรัตนโกสินทร์',
    teacher: 'ครู อ.พิมพ์พา รักษ์ไทย',
    department: 'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม',
    score: 18,
    maxScore: 20,
    grade: 'เกรด A',
    submittedAt: 'ส่งเมื่อ 21 ก.ย. 68',
    summaryText: 'ปรนัย 20 ข้อ • เวลาที่ใช้ 28 นาที',
    evaluationText: 'ผ่านเกณฑ์การประเมิน',
    footerNote: 'ดูข้อที่ตอบถูกและคำอธิบายเฉลย',
    buttonText: 'ดูผลคะแนนและเฉลย'
  }
]
