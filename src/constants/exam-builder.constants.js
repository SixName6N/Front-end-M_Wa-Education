export const INITIAL_EXAM_METADATA = {
  title: 'แบบทดสอบวัดผลกลางภาค: วิทยาศาสตร์และเทคโนโลยี ม.3',
  subjectCode: 'ว23101',
  semester: 'ภาคเรียนที่ 1/2568',
  targetScore: 30,
  durationMinutes: 60,
  targetGroup: 'ม.3/1 (35 คน)',
  dueDate: '25 ก.ย. 68 (16:30 น.)',
  shuffleQuestions: true,
  lastSavedText: 'ยังไม่ได้บันทึก'
}

export const INITIAL_QUESTIONS = [
  {
    id: 1,
    type: 'choice',
    typeName: 'ปรนัย (Multiple Choice)',
    score: 1,
    prompt: 'โครงสร้างใดของเซลล์พืชที่ทำหน้าที่หลักในการสังเคราะห์ด้วยแสง (Photosynthesis)?',
    choices: [
      { id: 'a', label: 'ก.', text: 'ไมโทคอนเดรีย (Mitochondria)', isCorrect: false },
      { id: 'b', label: 'ข.', text: 'คลอโรพลาสต์ (Chloroplast)', isCorrect: true },
      { id: 'c', label: 'ค.', text: 'ไรโบโซม (Ribosome)', isCorrect: false },
      { id: 'd', label: 'ง.', text: 'กอลจิบอดี (Golgi apparatus)', isCorrect: false }
    ],
    shuffleChoices: true,
    explanation: 'คลอโรพลาสต์เป็นออร์แกเนลล์ที่มีคลอโรฟิลล์ ใช้ในการสังเคราะห์ด้วยแสงเพื่อสร้างอาหารให้แก่พืช'
  },
  {
    id: 2,
    type: 'short_answer',
    typeName: 'ตอบสั้น (Short Answer)',
    score: 2,
    prompt: 'จงระบุหน่วยสากล (SI unit) ของแรง ตามหลักฟิสิกส์พื้นฐาน',
    acceptableKeys: ['นิวตัน', 'Newton', 'N'],
    caseInsensitive: true
  },
  {
    id: 3,
    type: 'essay',
    typeName: 'เขียนบรรยาย (Essay with Rubric)',
    score: 5,
    prompt: 'ให้นักเรียนอธิบายวัฏจักรของน้ำ (Water Cycle) โดยสังเขป พร้อมระบุกระบวนการสำคัญอย่างน้อย 3 ขั้นตอน และผลกระทบต่อสภาพภูมิอากาศ',
    rubrics: [
      {
        id: 'r1',
        name: 'เกณฑ์ที่ 1',
        title: 'กระบวนการระเหย (Evaporation & Transpiration)',
        desc: 'อธิบายการเปลี่ยนสถานะจากของเหลวเป็นไอน้ำครบถ้วน',
        score: 2.0
      },
      {
        id: 'r2',
        name: 'เกณฑ์ที่ 2',
        title: 'การควบแน่น & หยาดน้ำฟ้า (Condensation & Precipitation)',
        desc: 'ระบุการรวมตัวของเมฆและการตกลงสู่พื้นดิน',
        score: 2.0
      },
      {
        id: 'r3',
        name: 'เกณฑ์ที่ 3',
        title: 'ความเป็นระเบียบ & ความเชื่อมโยง',
        desc: 'การเรียบเรียงลำดับเหตุผลและสรุปความเข้าใจ',
        score: 1.0
      }
    ]
  }
]

export const DEFAULT_NEW_CHOICE_QUESTION = {
  type: 'choice',
  score: 1,
  prompt: '',
  choices: [
    { id: 'a', label: 'ก.', text: 'แรงลัพธ์มีค่าเท่ากับศูนย์', isCorrect: true },
    { id: 'b', label: 'ข.', text: 'วัตถุเคลื่อนที่ด้วยความเร่งคงที่สม่ำเสมอ', isCorrect: false },
    { id: 'c', label: 'ค.', text: 'มวลของวัตถุมีค่าเป็นศูนย์เมื่ออยู่ในอวกาศ', isCorrect: false },
    { id: 'd', label: 'ง.', text: 'แรงเสียดทานมีทิศเดียวกับการเคลื่อนที่ของวัตถุ', isCorrect: false }
  ]
}

export const QUESTION_TYPES = [
  { id: 'choice', label: 'ปรนัย (Choice)', icon: 'radio_button_checked' },
  { id: 'short_answer', label: 'ตอบสั้น', icon: 'short_text' },
  { id: 'essay', label: 'เขียนบรรยาย', icon: 'subject' },
  { id: 'true_false', label: 'ถูก / ผิด', icon: 'rule' }
]
