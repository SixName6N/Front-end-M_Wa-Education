export const TEACHER_PROFILE = {
  name: 'อ.กมลทิพย์ วิทยาศาสตร์',
  shortName: 'อ.กมลทิพย์',
  role: 'ครูผู้สอน',
  academicSession: 'ภาคเรียนที่ 1/2568'
}

export const CLASSROOM_OPTIONS = [
  { id: 'm3-1', label: 'มัธยมศึกษาปีที่ 3/1 (35 คน)', count: 35 },
  { id: 'm3-2', label: 'มัธยมศึกษาปีที่ 3/2 (34 คน)', count: 34 },
  { id: 'm3-3', label: 'มัธยมศึกษาปีที่ 3/3 (36 คน)', count: 36 }
]

export const TEACHER_METRICS = {
  submitted: 32,
  pendingReview: 7,
  notSubmitted: 3
}

export const INITIAL_STUDENTS = [
  {
    seat: 1,
    id: '30101',
    name: 'ด.ช. กิตติพงษ์ เจริญทรัพย์',
    status: 'graded',
    statusText: 'ตรวจแล้ว',
    score: 27,
    maxScore: 30,
    actionText: 'ดูผลสอบ'
  },
  {
    seat: 2,
    id: '30102',
    name: 'ด.ญ. จุฑามาศ ศรีสุข',
    status: 'pending',
    statusText: 'รอตรวจข้อเขียน',
    score: null,
    maxScore: 30,
    actionText: 'ตรวจข้อสอบ'
  },
  {
    seat: 3,
    id: '30103',
    name: 'นายชยพล นามสว่าง',
    status: 'unsubmitted',
    statusText: 'ยังไม่ส่งข้อสอบ',
    score: null,
    maxScore: 30,
    actionText: 'เตือนส่งงาน'
  },
  {
    seat: 4,
    id: '30104',
    name: 'ด.ญ. ญาณิศา วิจิตรศิลป์',
    status: 'graded',
    statusText: 'ตรวจแล้ว',
    score: 29,
    maxScore: 30,
    actionText: 'ดูผลสอบ'
  },
  {
    seat: 5,
    id: '30105',
    name: 'นายณัฐภัทร บุญมี',
    status: 'pending',
    statusText: 'รอตรวจข้อเขียน',
    score: null,
    maxScore: 30,
    actionText: 'ตรวจข้อสอบ'
  }
]
