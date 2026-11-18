/**
 * Exam and Question Mappers & Validators
 * แยก Mapper และ Helper สำหรับแปลงข้อมูลระหว่าง Backend API กับ UI State
 */

/**
 * แปลงข้อมูลชุดข้อสอบจาก API response เป็นรูปแบบที่ UI หน้าคลังข้อสอบใช้
 * @param {Object} item - Exam object from API
 */
export function mapApiExamToView(item) {
  const statusMap = {
    PUBLISHED: { status: 'published', statusText: 'เผยแพร่แล้ว' },
    CLOSED: { status: 'closed', statusText: 'ปิดแล้ว' },
    DRAFT: { status: 'draft', statusText: 'ฉบับร่าง' }
  }
  const mapped = statusMap[item.status] || { status: 'draft', statusText: 'ฉบับร่าง' }

  return {
    id: item.id,
    courseId: item.courseId || '',
    courseCode: item.course?.code || item.courseCode || '',
    category: item.category || 'สอบวัดผล',
    status: mapped.status,
    statusText: mapped.statusText,
    title: item.title,
    questionsCount: item._count?.questions ?? item.questions?.length ?? 0,
    maxScore: item.maxScore || 0,
    duration: item.timeLimitMinutes || 60,
    scheduleInfo: item.updatedAt
      ? `แก้ไขล่าสุด ${new Date(item.updatedAt).toLocaleDateString('th-TH')}`
      : 'พร้อมใช้งาน',
    highlightClass:
      item.status === 'PUBLISHED'
        ? 'bank-meta-highlight--secondary'
        : 'bank-meta-highlight--primary',
    updatedAt: item.updatedAt ? new Date(item.updatedAt).getTime() : Date.now()
  }
}

/**
 * แปลงคำถามจาก UI → body ของ POST /api/exams/:examId/questions
 * @param {Object} question - UI question model
 * @param {number} index - Question order index
 */
export function toApiQuestion(question, index) {
  const base = {
    prompt: String(question?.prompt ?? '').trim(),
    points: Number(question?.score) || 0,
    order: index,
    explanation: question?.explanation?.trim() || null
  }

  // ปรนัย + ถูก/ผิด → MULTIPLE_CHOICE (ต้องมีเฉลยถูก 1 ตัวเลือก)
  if (question?.type === 'choice' || question?.type === 'true_false') {
    return {
      ...base,
      type: 'MULTIPLE_CHOICE',
      choices: (question.choices ?? []).map((choice, choiceIndex) => ({
        label: String(choice?.label ?? '').trim() || `${choiceIndex + 1}.`,
        text: String(choice?.text ?? '').trim(),
        isCorrect: Boolean(choice?.isCorrect),
        order: choiceIndex
      }))
    }
  }

  // ตอบสั้น → เก็บคำตอบที่ยอมรับทั้งหมดไว้ใน referenceText
  if (question?.type === 'short_answer') {
    return {
      ...base,
      type: 'SHORT_ANSWER',
      referenceText: (question.acceptableKeys ?? []).join(', ') || null
    }
  }

  // เขียนบรรยาย → เก็บ rubric / เกณฑ์การให้คะแนนไว้ใน referenceText
  return {
    ...base,
    type: 'LONG_ANSWER',
    referenceText:
      (question?.rubrics ?? [])
        .map((rubric) => `${rubric.title}: ${rubric.desc} (${rubric.score} คะแนน)`)
        .join('\n') || null
  }
}

/**
 * ตรวจแบบร่างชุดข้อสอบก่อนยิง API
 * @returns {string} ข้อความ error แรกที่พบ หรือ '' เมื่อผ่านทั้งหมด
 */
export function validateExamDraft({ title, questions, classroomId } = {}) {
  if (!String(title ?? '').trim()) return 'กรุณาระบุชื่อชุดข้อสอบ'
  if (!classroomId) return 'กรุณาเลือกห้องเรียนที่จะมอบหมายข้อสอบ'

  if (!Array.isArray(questions) || questions.length === 0) {
    return 'กรุณาเพิ่มข้อสอบอย่างน้อย 1 ข้อ'
  }

  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index]
    const label = `ข้อที่ ${index + 1}`

    if (!String(question?.prompt ?? '').trim()) {
      return `${label}: กรุณากรอกโจทย์ข้อสอบ`
    }

    if (!(Number(question?.score) > 0)) {
      return `${label}: คะแนนต้องมากกว่า 0`
    }

    if (question.type === 'choice' || question.type === 'true_false') {
      const choices = question.choices ?? []

      if (choices.length < 2) {
        return `${label}: ต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก`
      }
      if (choices.length > 10) {
        return `${label}: มีตัวเลือกได้ไม่เกิน 10 ตัวเลือก`
      }
      if (choices.some((choice) => !String(choice?.text ?? '').trim())) {
        return `${label}: กรุณากรอกข้อความตัวเลือกให้ครบทุกข้อ`
      }
      if (choices.filter((choice) => choice.isCorrect).length !== 1) {
        return `${label}: ต้องมีเฉลยที่ถูกต้อง 1 ตัวเลือกเท่านั้น`
      }
    }
  }

  return ''
}
