export const INITIAL_EXAM_METADATA = {
  title: '',
  subjectCode: '',
  semester: '',
  targetScore: 0,
  durationMinutes: 60,
  targetGroup: '',
  dueDate: '',
  shuffleQuestions: false,
  lastSavedText: 'ยังไม่ได้บันทึก'
}

export const INITIAL_QUESTIONS = []

export const DEFAULT_NEW_CHOICE_QUESTION = {
  type: 'choice',
  score: 1,
  prompt: '',
  choices: [
    { id: 'a', label: 'ก.', text: '', isCorrect: true },
    { id: 'b', label: 'ข.', text: '', isCorrect: false },
    { id: 'c', label: 'ค.', text: '', isCorrect: false },
    { id: 'd', label: 'ง.', text: '', isCorrect: false }
  ]
}

export const QUESTION_TYPES = [
  { id: 'choice', label: 'ปรนัย (Choice)', icon: 'radio_button_checked' },
  { id: 'short_answer', label: 'ตอบสั้น', icon: 'short_text' },
  { id: 'essay', label: 'เขียนบรรยาย', icon: 'subject' },
  { id: 'true_false', label: 'ถูก / ผิด', icon: 'rule' }
]
