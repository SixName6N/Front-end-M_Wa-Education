/**
 * ตัวแปลง/ตรวจสอบข้อมูลของหน้า Teacher Exam Builder
 * แยกเป็น pure function เพื่อทดสอบได้โดยไม่ต้องพึ่ง Vue หรือ fetch
 */

/** แปลงคำถามจาก UI → body ของ POST /api/exams/:examId/questions */
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

  // เขียนบรรยาย → backend ไม่มีฟิลด์ rubric จึงสรุปเกณฑ์ไว้ใน referenceText
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
 * ตรวจ draft ก่อนยิง API
 * @returns ข้อความ error แรกที่พบ หรือ '' เมื่อผ่านทั้งหมด
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
