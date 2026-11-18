<template>
  <TeacherLayout active-tab="exams">
    <div class="eb-page">
      <!-- TOP CONTEXT / HEADER BAR -->
      <section class="eb-top-bar">
        <!-- Breadcrumb -->
        <nav aria-label="Breadcrumb" class="eb-breadcrumb">
          <router-link to="/teacher/exams" class="eb-breadcrumb__link">คลังข้อสอบ</router-link>
          <span class="material-symbols-outlined eb-breadcrumb__sep">chevron_right</span>
          <span class="eb-breadcrumb__link">วิชาวิทยาศาสตร์และเทคโนโลยี ม.3</span>
          <span class="material-symbols-outlined eb-breadcrumb__sep">chevron_right</span>
          <span class="eb-breadcrumb__current">สร้างชุดข้อสอบใหม่</span>
        </nav>

        <!-- Exam Header / Title & Actions -->
        <div class="eb-title-container">
          <div class="eb-title-left">
            <div class="eb-title-input-wrap">
              <input
                v-model="metadata.title"
                class="eb-title-input"
                type="text"
                title="คลิกเพื่อแก้ไขชื่อชุดข้อสอบ"
                placeholder="ระบุชื่อชุดข้อสอบ..."
              />
              <span class="material-symbols-outlined eb-title-edit-icon">edit</span>
            </div>

            <!-- Metadata Tags -->
            <div class="eb-meta-tags">
              <span class="eb-tag eb-tag--pill">
                <span class="material-symbols-outlined eb-tag-icon">tag</span>
                รหัสวิชา {{ metadata.subjectCode }}
              </span>
              <span class="eb-dot">•</span>
              <span>{{ metadata.semester }}</span>
              <span class="eb-dot">•</span>
              <span class="eb-tag-target">เป้าหมาย {{ metadata.targetScore }} คะแนน</span>
              <span class="eb-dot">•</span>
              <span>เวลาสอบ {{ metadata.durationMinutes }} นาที</span>
              <span class="eb-dot">•</span>
              <span class="eb-tag eb-tag--saved">
                <span class="material-symbols-outlined eb-saved-icon">cloud_done</span>
                {{ metadata.lastSavedText }}
              </span>
            </div>
          </div>

          <!-- Header CTA Buttons -->
          <div class="eb-title-actions">
            <button
              type="button"
              class="eb-btn eb-btn--secondary"
              @click="showPreview = true"
            >
              <span class="material-symbols-outlined">visibility</span>
              <span>แสดงตัวอย่าง (Preview)</span>
            </button>
            <button
              type="button"
              class="eb-btn eb-btn--primary"
              @click="handlePublish"
            >
              <span class="material-symbols-outlined">publish</span>
              <span>บันทึกและเผยแพร่</span>
            </button>
          </div>
        </div>
      </section>

      <!-- MAIN SPLIT WORKSPACE GRID -->
      <div class="eb-workspace-grid">
        <!-- LEFT: QUESTIONS EDITOR (8 Cols) -->
        <div class="eb-main-col">
          <!-- Section Tracker Header -->
          <div class="eb-tracker-bar">
            <div>
              <h2 class="eb-tracker-title">รายการข้อสอบในชุด</h2>
              <p class="eb-tracker-sub">
                ข้อสอบร่างปัจจุบัน {{ questions.length }} ข้อ • รวมที่ระบุแล้ว {{ currentTotalScore }} คะแนน จาก {{ metadata.targetScore }} คะแนน
              </p>
            </div>
            <div class="eb-tracker-badge">
              <span class="eb-status-dot"></span>
              <span>โหมดจัดเรียงปกติ</span>
            </div>
          </div>

          <!-- Question Cards List -->
          <div class="eb-cards-stack">
            <div
              v-for="(question, index) in questions"
              :key="question.id"
              :ref="el => questionRefs[index] = el"
              class="eb-card"
            >
              <!-- QUESTION CARD TOP -->
              <div class="eb-card-top">
                <div class="eb-card-header-left">
                  <span class="eb-num-badge">{{ index + 1 }}</span>
                  <div class="eb-card-title-group">
                    <span class="eb-card-title">ข้อที่ {{ index + 1 }} • {{ question.typeName }}</span>
                    <span
                      class="eb-score-tag"
                      :class="{ 'eb-score-tag--amber': question.type === 'essay' }"
                    >
                      {{ question.score }} คะแนน
                    </span>
                  </div>
                </div>

                <!-- Actions: Move Up, Move Down, Copy, Delete -->
                <div class="eb-card-actions">
                  <button
                    type="button"
                    class="eb-icon-btn"
                    title="เลื่อนขึ้น"
                    :disabled="index === 0"
                    @click="moveQuestion(index, -1)"
                  >
                    <span class="material-symbols-outlined">keyboard_arrow_up</span>
                  </button>
                  <button
                    type="button"
                    class="eb-icon-btn"
                    title="เลื่อนลง"
                    :disabled="index === questions.length - 1"
                    @click="moveQuestion(index, 1)"
                  >
                    <span class="material-symbols-outlined">keyboard_arrow_down</span>
                  </button>
                  <button
                    type="button"
                    class="eb-icon-btn"
                    title="คัดลอกข้อสอบ"
                    @click="copyQuestion(index)"
                  >
                    <span class="material-symbols-outlined">content_copy</span>
                  </button>
                  <button
                    type="button"
                    class="eb-icon-btn eb-icon-btn--danger"
                    title="ลบข้อสอบ"
                    @click="deleteQuestion(index)"
                  >
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>

              <!-- QUESTION PROMPT -->
              <div class="eb-card-prompt">
                {{ question.prompt }}
              </div>

              <!-- QUESTION TYPE: MULTIPLE CHOICE OR TRUE/FALSE -->
              <div v-if="question.type === 'choice' || question.type === 'true_false'" class="eb-choices-container">
                <div
                  v-for="choice in question.choices"
                  :key="choice.id"
                  class="eb-choice-row"
                  :class="{ 'eb-choice-row--correct': choice.isCorrect }"
                >
                  <label class="eb-choice-label">
                    <input
                      type="radio"
                      :name="`preview_${question.id}`"
                      :checked="choice.isCorrect"
                      disabled
                      class="eb-radio"
                    />
                    <span
                      class="eb-choice-text"
                      :class="{ 'eb-choice-text--correct': choice.isCorrect }"
                    >
                      {{ choice.label }} {{ choice.text }}
                    </span>
                  </label>

                  <span v-if="choice.isCorrect" class="eb-correct-pill">
                    <span class="material-symbols-outlined text-[13px]">check_circle</span>
                    คำตอบที่ถูกต้อง
                  </span>
                </div>

                <!-- Footer options -->
                <div class="eb-card-footer">
                  <label class="eb-footer-checkbox">
                    <input
                      type="checkbox"
                      v-model="question.shuffleChoices"
                      @change="handleAutoSave"
                    />
                    <span>สลับตำแหน่งช้อยส์อัตโนมัติ (Shuffle choices)</span>
                  </label>

                  <button
                    type="button"
                    class="eb-footer-link"
                    @click="toggleExplanation(question.id)"
                  >
                    <span class="material-symbols-outlined text-[14px]">help</span>
                    <span>คำอธิบายเฉลยเพิ่มเติม (Optional)</span>
                  </button>
                </div>

                <!-- Explanation Box -->
                <div v-if="activeExplanations[question.id]" class="eb-explanation-box">
                  <div class="eb-exp-title">
                    <span class="material-symbols-outlined text-[16px]">lightbulb</span>
                    คำอธิบายเฉลย:
                  </div>
                  <p class="eb-exp-desc">{{ question.explanation || 'ยังไม่มีคำอธิบายเพิ่มเติม' }}</p>
                </div>
              </div>

              <!-- QUESTION TYPE: SHORT ANSWER -->
              <div v-else-if="question.type === 'short_answer'" class="eb-short-ans-box">
                <div class="eb-short-ans-title">
                  <span class="material-symbols-outlined text-[16px]">vpn_key</span>
                  คีย์คำตอบที่ยอมรับ (Acceptable Answer Keys):
                </div>

                <div class="eb-keys-wrap">
                  <template v-for="(k, i) in question.acceptableKeys" :key="i">
                    <span class="eb-key-pill">
                      {{ k }}
                      <span class="material-symbols-outlined text-[12px]">check</span>
                    </span>
                    <span v-if="i < question.acceptableKeys.length - 1" class="eb-key-sep">หรือ</span>
                  </template>

                  <button
                    type="button"
                    class="eb-add-key-btn"
                    @click="addAlternateKey(question)"
                  >
                    <span class="material-symbols-outlined text-[14px]">add</span>
                    เพิ่มคำตอบสำรอง
                  </button>
                </div>

                <div class="eb-case-sens-row">
                  <input
                    type="checkbox"
                    :id="`cs_${question.id}`"
                    v-model="question.caseInsensitive"
                    @change="handleAutoSave"
                  />
                  <label :for="`cs_${question.id}`">
                    ไม่สนตัวพิมพ์เล็ก-ใหญ่ (Case-insensitive matching)
                  </label>
                </div>
              </div>

              <!-- QUESTION TYPE: ESSAY WITH RUBRIC -->
              <div v-else-if="question.type === 'essay'" class="eb-rubric-wrapper">
                <div class="eb-rubric-top">
                  <span class="eb-rubric-heading">
                    <span class="material-symbols-outlined text-[16px]">fact_check</span>
                    เกณฑ์การให้คะแนนรูบริก (Scoring Rubric):
                  </span>
                  <button
                    type="button"
                    class="eb-edit-rubric-btn"
                    @click="handleEditRubric"
                  >
                    <span class="material-symbols-outlined text-[14px]">edit</span>
                    แก้ไขเกณฑ์
                  </button>
                </div>

                <div class="eb-rubric-grid">
                  <div
                    v-for="r in question.rubrics"
                    :key="r.id"
                    class="eb-rubric-card"
                  >
                    <div class="eb-rubric-card-body">
                      <span class="eb-rubric-step">{{ r.name }}</span>
                      <h4 class="eb-rubric-name">{{ r.title }}</h4>
                      <p class="eb-rubric-desc">{{ r.desc }}</p>
                    </div>
                    <div class="eb-rubric-points">
                      {{ Number(r.score).toFixed(1) }} คะแนน
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ACTIVE INLINE QUESTION BUILDER FORM (CARD 4) -->
          <div ref="builderRef" class="eb-card eb-card--builder">
            <div class="eb-card-top">
              <div class="eb-card-header-left">
                <span class="eb-num-badge eb-num-badge--active">{{ questions.length + 1 }}</span>
                <div>
                  <h3 class="eb-builder-title">+ เพิ่มข้อสอบข้อที่ {{ questions.length + 1 }}</h3>
                  <p class="eb-builder-sub">กำลังแก้ไขข้อมูลข้อสอบใหม่ในชุด</p>
                </div>
              </div>

              <!-- Score Input -->
              <div class="eb-builder-score-input">
                <label for="builder_score_input">คะแนนข้อนี้:</label>
                <input
                  id="builder_score_input"
                  v-model.number="newForm.score"
                  type="number"
                  min="0.5"
                  step="0.5"
                  class="eb-score-num-field"
                />
                <span>คะแนน</span>
              </div>
            </div>

            <!-- Question Type Tabs -->
            <div class="eb-tabs-strip">
              <button
                v-for="t in typeOptions"
                :key="t.id"
                type="button"
                class="eb-tab-btn"
                :class="{ 'eb-tab-btn--active': newForm.type === t.id }"
                @click="newForm.type = t.id"
              >
                <span class="material-symbols-outlined text-[16px]">{{ t.icon }}</span>
                <span>{{ t.label }}</span>
              </button>
            </div>

            <!-- Rich Textarea with Quick Format Bar -->
            <div class="eb-rich-editor">
              <div class="eb-format-bar">
                <button type="button" class="eb-fmt-btn" title="ตัวหนา" @click="insertFormat('**ข้อความตัวหนา**')">
                  <span class="material-symbols-outlined text-[18px]">format_bold</span>
                </button>
                <button type="button" class="eb-fmt-btn" title="ตัวเอียง" @click="insertFormat('*ข้อความตัวเอียง*')">
                  <span class="material-symbols-outlined text-[18px]">format_italic</span>
                </button>
                <button type="button" class="eb-fmt-btn" title="ตัวขีดเส้นใต้" @click="insertFormat('<u>ขีดเส้นใต้</u>')">
                  <span class="material-symbols-outlined text-[18px]">format_underlined</span>
                </button>
                <span class="eb-fmt-sep"></span>
                <button type="button" class="eb-fmt-btn" title="สูตรคณิตศาสตร์ / วิทยาศาสตร์" @click="insertFormat(' E = mc² ')">
                  <span class="material-symbols-outlined text-[18px]">functions</span>
                </button>
                <button type="button" class="eb-fmt-btn" title="แทรกรูปภาพโจทย์" @click="insertImagePrompt">
                  <span class="material-symbols-outlined text-[18px]">image</span>
                </button>
                <button type="button" class="eb-fmt-btn" title="สัญลักษณ์ทางวิทยาศาสตร์" @click="insertFormat(' λ, π, Δ, Ω ')">
                  <span class="material-symbols-outlined text-[18px]">science</span>
                </button>
              </div>
              <textarea
                v-model="newForm.prompt"
                class="eb-prompt-textarea"
                rows="3"
                :placeholder="`พิมพ์คำถาม หรือข้อความโจทย์ข้อที่ ${questions.length + 1} ที่นี่... (รองรับการวางรูปภาพและสูตรทางคณิตศาสตร์)`"
              ></textarea>
            </div>

            <!-- TYPE: CHOICE BUILDER -->
            <div v-if="newForm.type === 'choice'" class="eb-builder-choices">
              <div class="eb-choices-meta-row">
                <span>ตัวเลือกคำตอบ (เลือก Radio หน้ารายการที่เป็นคำตอบที่ถูกต้อง):</span>
                <span class="eb-min-note">อย่างน้อย 2 ตัวเลือก</span>
              </div>

              <div
                v-for="(c, cIdx) in newForm.choices"
                :key="c.id"
                class="eb-choice-edit-row"
              >
                <input
                  type="radio"
                  name="active_new_correct"
                  :checked="c.isCorrect"
                  class="eb-radio"
                  title="กำหนดให้ตัวเลือกนี้เป็นข้อถูก"
                  @change="setCorrectChoice(cIdx)"
                />
                <span class="eb-choice-thai-label">{{ c.label }}</span>
                <input
                  v-model="c.text"
                  type="text"
                  class="eb-choice-input"
                  :placeholder="`ระบุตัวเลือก ${c.label}`"
                />
                <span v-if="c.isCorrect" class="eb-correct-badge-sm">เฉลย</span>
                <button
                  v-if="newForm.choices.length > 2"
                  type="button"
                  class="eb-del-choice-btn"
                  title="ลบตัวเลือกนี้"
                  @click="removeChoiceItem(cIdx)"
                >
                  <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  class="eb-add-choice-btn"
                  @click="addNewChoice"
                >
                  <span class="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>+ เพิ่มตัวเลือกถัดไป (Add Choice)</span>
                </button>
              </div>
            </div>

            <!-- TYPE: SHORT ANSWER BUILDER -->
            <div v-else-if="newForm.type === 'short_answer'" class="eb-short-ans-box">
              <div class="eb-short-ans-title">
                <span class="material-symbols-outlined text-[16px]">vpn_key</span>
                คีย์คำตอบที่ยอมรับ (พิมพ์แล้วกด Enter เพื่อเพิ่ม):
              </div>
              <div class="eb-keys-wrap">
                <span
                  v-for="(k, i) in newForm.acceptableKeys"
                  :key="i"
                  class="eb-key-pill"
                >
                  {{ k }}
                  <button type="button" @click="newForm.acceptableKeys.splice(i, 1)">
                    <span class="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
                <input
                  v-model="newKeyInput"
                  type="text"
                  class="eb-choice-input"
                  style="width: 170px; padding: 4px 8px;"
                  placeholder="พิมพ์คำตอบแล้ว Enter"
                  @keydown.enter.prevent="addBuilderKey"
                />
              </div>
            </div>

            <!-- TYPE: ESSAY BUILDER -->
            <div v-else-if="newForm.type === 'essay'" class="eb-rubric-wrapper">
              <span class="eb-rubric-heading">
                <span class="material-symbols-outlined text-[16px]">fact_check</span>
                เกณฑ์การตรวจข้อเขียน (Rubric):
              </span>
              <p style="font-size: 13px; color: #4b5563; margin-top: 4px;">
                ระบบจะสร้างเกณฑ์เริ่มต้นให้อัตโนมัติ สามารถกดบันทึกแล้วปรับแก้ไขเกณฑ์ได้ตามต้องการ
              </p>
            </div>

            <!-- TYPE: TRUE/FALSE BUILDER -->
            <div v-else-if="newForm.type === 'true_false'" class="eb-choices-container">
              <div class="eb-choices-meta-row">
                <span>เลือกคำตอบที่ถูกต้อง:</span>
              </div>
              <div style="display: flex; gap: 12px; margin-top: 4px;">
                <label class="eb-choice-row" style="flex: 1; cursor: pointer;">
                  <input
                    type="radio"
                    name="tf_new"
                    :checked="newForm.tfCorrect === true"
                    class="eb-radio"
                    @change="newForm.tfCorrect = true"
                  />
                  <span style="font-weight: 600; color: #156634; margin-left: 8px;">✓ ถูกต้อง (True)</span>
                </label>
                <label class="eb-choice-row" style="flex: 1; cursor: pointer;">
                  <input
                    type="radio"
                    name="tf_new"
                    :checked="newForm.tfCorrect === false"
                    class="eb-radio"
                    @change="newForm.tfCorrect = false"
                  />
                  <span style="font-weight: 600; color: #ba1a1a; margin-left: 8px;">✕ ผิด (False)</span>
                </label>
              </div>
            </div>

            <!-- Builder Bottom Actions -->
            <div class="eb-builder-actions">
              <button
                type="button"
                class="eb-btn eb-btn--ghost"
                @click="resetNewForm"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                class="eb-btn eb-btn--primary"
                @click="saveNewQuestionToSet"
              >
                <span class="material-symbols-outlined text-[18px]">save</span>
                <span>บันทึกข้อนี้เข้าชุด</span>
              </button>
            </div>
          </div>

          <!-- BIG ADD QUESTION PROMPT BUTTON -->
          <div class="eb-big-add-card" @click="scrollToBuilder">
            <div class="eb-big-add-icon">
              <span class="material-symbols-outlined text-[26px]">add</span>
            </div>
            <div>
              <h4 class="eb-big-add-title">+ เพิ่มข้อสอบข้อถัดไป (Add New Question)</h4>
              <p class="eb-big-add-sub">เลือกรูปแบบข้อสอบเพื่อเริ่มพิมพ์คำถามข้อถัดไปในชุดนี้</p>
            </div>
            <div class="eb-quick-pill-row" @click.stop>
              <button type="button" class="eb-quick-type-pill" @click="setBuilderType('choice')">ปรนัย</button>
              <button type="button" class="eb-quick-type-pill" @click="setBuilderType('short_answer')">ตอบสั้น</button>
              <button type="button" class="eb-quick-type-pill" @click="setBuilderType('essay')">เขียนบรรยาย</button>
              <button type="button" class="eb-quick-type-pill" @click="setBuilderType('true_false')">ถูก / ผิด</button>
            </div>
          </div>
        </div>

        <!-- RIGHT: STICKY SIDEBAR (4 Cols) -->
        <aside class="eb-side-col">
          <!-- CARD 1: Exam Rules -->
          <section class="eb-side-card">
            <div class="eb-side-card-header">
              <h3 class="eb-side-card-title">
                <span class="material-symbols-outlined text-primary text-[18px]">settings</span>
                ตั้งค่าชุดข้อสอบ (Exam Rules)
              </h3>
              <button type="button" class="eb-side-link" @click="handleAdvancedSettings">ขั้นสูง</button>
            </div>

            <div class="eb-side-rows-list">
              <!-- Duration -->
              <div class="eb-side-row">
                <div class="eb-side-row-label">
                  <span class="material-symbols-outlined text-[18px]">timer</span>
                  <span>เวลาทำข้อสอบ</span>
                </div>
                <span class="eb-side-row-val">{{ metadata.durationMinutes }} นาที</span>
              </div>

              <!-- Shuffle questions toggle -->
              <div class="eb-side-row">
                <div class="eb-side-row-label">
                  <span class="material-symbols-outlined text-[18px]">shuffle</span>
                  <span>สลับลำดับข้อสอบ</span>
                </div>
                <button
                  type="button"
                  class="eb-toggle-pill"
                  :class="{ 'eb-toggle-pill--on': metadata.shuffleQuestions }"
                  @click="metadata.shuffleQuestions = !metadata.shuffleQuestions"
                >
                  {{ metadata.shuffleQuestions ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                </button>
              </div>

              <!-- Due date -->
              <div class="eb-side-row">
                <div class="eb-side-row-label">
                  <span class="material-symbols-outlined text-[18px]">calendar_today</span>
                  <span>กำหนดส่ง</span>
                </div>
                <span class="eb-side-row-text">{{ metadata.dueDate }}</span>
              </div>

              <!-- Target Group -->
              <div class="eb-side-row">
                <div class="eb-side-row-label">
                  <span class="material-symbols-outlined text-[18px]">groups</span>
                  <span>กลุ่มผู้มีสิทธิ์สอบ</span>
                </div>
                <span class="eb-side-row-val">{{ metadata.targetGroup }}</span>
              </div>
            </div>
          </section>

          <!-- CARD 2: Score Map -->
          <section class="eb-side-card">
            <div class="eb-side-card-header">
              <h3 class="eb-side-card-title">
                <span class="material-symbols-outlined text-secondary text-[18px]">analytics</span>
                โครงสร้างคะแนน (Score Map)
              </h3>
              <span class="eb-side-badge-count">{{ questions.length }} ข้อ</span>
            </div>

            <!-- Score Progress Meter -->
            <div class="eb-meter-card">
              <div class="eb-meter-labels">
                <span>คะแนนปัจจุบัน</span>
                <strong>{{ currentTotalScore }} / {{ metadata.targetScore }} คะแนน ({{ scorePercentage }}%)</strong>
              </div>
              <div class="eb-meter-track">
                <div class="eb-meter-fill" :style="{ width: `${Math.min(scorePercentage, 100)}%` }"></div>
              </div>
              <span class="eb-meter-sub">
                <template v-if="remainingScore > 0">ขาดอีก {{ remainingScore }} คะแนนจะครบชุด</template>
                <template v-else-if="remainingScore === 0">✓ ครบเป้าหมาย {{ metadata.targetScore }} คะแนนแล้ว</template>
                <template v-else>เกินเป้าหมาย +{{ Math.abs(remainingScore) }} คะแนน</template>
              </span>
            </div>

            <!-- Question Types Breakdown Table -->
            <div class="eb-breakdown-list">
              <div class="eb-breakdown-row">
                <span class="eb-breakdown-item">
                  <span class="eb-dot-badge eb-dot-badge--blue"></span>
                  <span>ปรนัย 4 ตัวเลือก</span>
                </span>
                <strong>{{ breakdownStats.choice.count }} ข้อ ({{ breakdownStats.choice.score }} คะแนน)</strong>
              </div>

              <div class="eb-breakdown-row">
                <span class="eb-breakdown-item">
                  <span class="eb-dot-badge eb-dot-badge--teal"></span>
                  <span>ตอบสั้น (Short Answer)</span>
                </span>
                <strong>{{ breakdownStats.short.count }} ข้อ ({{ breakdownStats.short.score }} คะแนน)</strong>
              </div>

              <div class="eb-breakdown-row">
                <span class="eb-breakdown-item">
                  <span class="eb-dot-badge eb-dot-badge--amber"></span>
                  <span>เขียนบรรยาย (Rubric)</span>
                </span>
                <strong>{{ breakdownStats.essay.count }} ข้อ ({{ breakdownStats.essay.score }} คะแนน)</strong>
              </div>
            </div>

            <!-- Quick Navigation Matrix (Pills) -->
            <div class="eb-matrix-container">
              <span class="eb-matrix-title">ข้ามไปยังข้อ (Question Matrix):</span>
              <div class="eb-matrix-grid">
                <button
                  v-for="(q, idx) in questions"
                  :key="q.id"
                  type="button"
                  class="eb-matrix-cell eb-matrix-cell--done"
                  @click="scrollToIndex(idx)"
                >
                  {{ idx + 1 }}
                </button>
                <button
                  type="button"
                  class="eb-matrix-cell eb-matrix-cell--active"
                  @click="scrollToBuilder"
                >
                  {{ questions.length + 1 }}*
                </button>
                <div class="eb-matrix-cell eb-matrix-cell--empty">
                  {{ questions.length + 2 }}
                </div>
              </div>
            </div>
          </section>

          <!-- CARD 3: Quick Import Tools -->
          <section class="eb-side-card">
            <h3 class="eb-side-card-title">
              <span class="material-symbols-outlined text-secondary text-[18px]">bolt</span>
              นำเข้าข้อสอบด่วน (Quick Import)
            </h3>
            <p class="eb-side-card-desc">ลดเวลาการจัดพิมพ์ด้วยระบบแปลงชุดข้อสอบอัตโนมัติ</p>

            <div class="eb-side-buttons-stack">
              <button type="button" class="eb-import-link-btn" @click="handleImportFile">
                <span class="eb-import-link-left">
                  <span class="material-symbols-outlined text-primary text-[20px]">upload_file</span>
                  <span>นำเข้าไฟล์ Word / Excel / CSV</span>
                </span>
                <span class="material-symbols-outlined text-[16px] text-gray-400">arrow_forward</span>
              </button>

              <button type="button" class="eb-import-link-btn" @click="handleImportBank">
                <span class="eb-import-link-left">
                  <span class="material-symbols-outlined text-secondary text-[20px]">cloud_sync</span>
                  <span>ดึงข้อสอบจากคลังกลาง (Question Bank)</span>
                </span>
                <span class="material-symbols-outlined text-[16px] text-gray-400">arrow_forward</span>
              </button>
            </div>
          </section>

          <!-- Teacher Help Note -->
          <div class="eb-info-banner">
            <span class="material-symbols-outlined eb-info-icon">info</span>
            <p class="eb-info-text">
              ระบบบันทึกคำถามและตัวเลือกแบบเรียลไทม์ คุณครูสามารถปิดหน้านี้แล้วกลับมาแก้ต่อได้ทุกเมื่อ
            </p>
          </div>
        </aside>
      </div>

      <!-- PREVIEW MODAL -->
      <div v-if="showPreview" class="eb-modal-backdrop" @click.self="showPreview = false">
        <div class="eb-modal-box">
          <div class="eb-modal-top">
            <div>
              <h3 class="eb-modal-heading">แสดงตัวอย่างข้อสอบ (Student Exam Preview)</h3>
              <p class="eb-modal-sub">{{ metadata.title }} • {{ metadata.subjectCode }}</p>
            </div>
            <button type="button" class="eb-icon-btn" @click="showPreview = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="eb-modal-scroll">
            <div class="eb-modal-summary">
              <span>จำนวนข้อสอบ: <strong>{{ questions.length }} ข้อ</strong></span>
              <span>คะแนนเต็ม: <strong>{{ currentTotalScore }} / {{ metadata.targetScore }} คะแนน</strong></span>
              <span>เวลาสอบ: <strong>{{ metadata.durationMinutes }} นาที</strong></span>
            </div>

            <div
              v-for="(q, idx) in questions"
              :key="q.id"
              class="eb-card"
              style="margin-bottom: 16px;"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="eb-card-title">ข้อที่ {{ idx + 1 }} ({{ q.score }} คะแนน)</span>
                <span class="eb-score-tag">{{ q.typeName }}</span>
              </div>
              <p style="font-size: 15px; margin-top: 8px; color: #1f2937;">{{ q.prompt }}</p>

              <!-- Choice preview -->
              <div v-if="q.choices" style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
                <label
                  v-for="c in q.choices"
                  :key="c.id"
                  class="eb-choice-row"
                  style="cursor: pointer;"
                >
                  <input type="radio" :name="`preview_m_${q.id}`" class="eb-radio" />
                  <span style="font-size: 14px; margin-left: 8px; color: #1f2937;">{{ c.label }} {{ c.text }}</span>
                </label>
              </div>

              <!-- Short ans preview -->
              <div v-else-if="q.acceptableKeys" style="margin-top: 10px;">
                <input type="text" class="eb-choice-input" placeholder="พิมพ์คำตอบของคุณที่นี่..." disabled />
              </div>

              <!-- Essay preview -->
              <div v-else-if="q.rubrics" style="margin-top: 10px;">
                <textarea class="eb-prompt-textarea" rows="3" placeholder="พิมพ์คำตอบบรรยายของคุณที่นี่..." disabled></textarea>
              </div>
            </div>
          </div>

          <div class="eb-modal-bottom">
            <button type="button" class="eb-btn eb-btn--secondary" @click="showPreview = false">
              ปิดหน้าต่างตัวอย่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  </TeacherLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TeacherLayout from '@/layouts/TeacherLayout.vue'
import { examService } from '@/services/examService'
import {
  INITIAL_EXAM_METADATA,
  INITIAL_QUESTIONS,
  QUESTION_TYPES
} from '@/constants/exam-builder.constants'

const route = useRoute()
const router = useRouter()

const metadata = reactive({ ...INITIAL_EXAM_METADATA })
const questions = ref(JSON.parse(JSON.stringify(INITIAL_QUESTIONS)))
const showPreview = ref(false)

const questionRefs = ref([])
const builderRef = ref(null)
const activeExplanations = reactive({})
const newKeyInput = ref('')

const typeOptions = QUESTION_TYPES
const thaiLabels = ['ก.', 'ข.', 'ค.', 'ง.', 'จ.', 'ฉ.']

const newForm = reactive({
  type: 'choice',
  score: 1,
  prompt: 'เมื่อปล่อยลูกบอลให้ตกอย่างอิสระในแนวดิ่งภายใต้แรงโน้มถ่วงของโลก (โดยไม่คิดแรงต้านอากาศ) ข้อใดกล่าวถูกต้องที่สุด?',
  choices: [
    { id: 'c1', label: 'ก.', text: 'แรงลัพธ์มีค่าเท่ากับศูนย์', isCorrect: true },
    { id: 'c2', label: 'ข.', text: 'วัตถุเคลื่อนที่ด้วยความเร่งคงที่สม่ำเสมอ', isCorrect: false },
    { id: 'c3', label: 'ค.', text: 'มวลของวัตถุมีค่าเป็นศูนย์เมื่ออยู่ในอวกาศ', isCorrect: false },
    { id: 'c4', label: 'ง.', text: 'แรงเสียดทานมีทิศเดียวกับการเคลื่อนที่ของวัตถุ', isCorrect: false }
  ],
  acceptableKeys: ['ความเร่ง', 'g', '9.8'],
  tfCorrect: true
})

const currentTotalScore = computed(() => {
  return questions.value.reduce((sum, q) => sum + (Number(q.score) || 0), 0)
})

const scorePercentage = computed(() => {
  if (!metadata.targetScore) return 0
  return Math.round((currentTotalScore.value / metadata.targetScore) * 100)
})

const remainingScore = computed(() => {
  return metadata.targetScore - currentTotalScore.value
})

const breakdownStats = computed(() => {
  const res = {
    choice: { count: 0, score: 0 },
    short: { count: 0, score: 0 },
    essay: { count: 0, score: 0 }
  }

  questions.value.forEach((q) => {
    const s = Number(q.score) || 0
    if (q.type === 'choice' || q.type === 'true_false') {
      res.choice.count++
      res.choice.score += s
    } else if (q.type === 'short_answer') {
      res.short.count++
      res.short.score += s
    } else if (q.type === 'essay') {
      res.essay.count++
      res.essay.score += s
    }
  })

  return res
})

const moveQuestion = (index, direction) => {
  const target = index + direction
  if (target < 0 || target >= questions.value.length) return
  const item = questions.value.splice(index, 1)[0]
  questions.value.splice(target, 0, item)
  handleAutoSave()
}

const copyQuestion = (index) => {
  const source = questions.value[index]
  const clone = JSON.parse(JSON.stringify(source))
  clone.id = Date.now()
  clone.prompt = `${clone.prompt} (สำเนา)`
  questions.value.splice(index + 1, 0, clone)
  handleAutoSave()
}

const deleteQuestion = (index) => {
  if (confirm(`คุณต้องการลบข้อสอบข้อที่ ${index + 1} หรือไม่?`)) {
    questions.value.splice(index, 1)
    handleAutoSave()
  }
}

const toggleExplanation = (id) => {
  activeExplanations[id] = !activeExplanations[id]
}

const addAlternateKey = (question) => {
  const key = prompt('ระบุคำตอบสำรองที่ยอมรับ:')
  if (key && key.trim()) {
    question.acceptableKeys.push(key.trim())
    handleAutoSave()
  }
}

const setCorrectChoice = (idx) => {
  newForm.choices.forEach((c, i) => {
    c.isCorrect = i === idx
  })
}

const addNewChoice = () => {
  const len = newForm.choices.length
  newForm.choices.push({
    id: `c_${Date.now()}_${len}`,
    label: thaiLabels[len] || `${len + 1}.`,
    text: '',
    isCorrect: false
  })
}

const removeChoiceItem = (idx) => {
  if (newForm.choices.length <= 2) return
  newForm.choices.splice(idx, 1)
  newForm.choices.forEach((c, i) => {
    c.label = thaiLabels[i] || `${i + 1}.`
  })
  if (!newForm.choices.some(c => c.isCorrect)) {
    newForm.choices[0].isCorrect = true
  }
}

const addBuilderKey = () => {
  if (newKeyInput.value.trim()) {
    newForm.acceptableKeys.push(newKeyInput.value.trim())
    newKeyInput.value = ''
  }
}

const insertFormat = (str) => {
  newForm.prompt += str
}

const insertImagePrompt = () => {
  const url = prompt('ระบุ URL รูปภาพโจทย์:')
  if (url) newForm.prompt += ` ![โจทย์](${url})`
}

const setBuilderType = (type) => {
  newForm.type = type
  scrollToBuilder()
}

const saveNewQuestionToSet = () => {
  if (!newForm.prompt.trim()) {
    alert('กรุณากรอกข้อความโจทย์ข้อสอบ')
    return
  }

  const q = {
    id: Date.now(),
    type: newForm.type,
    score: Number(newForm.score) || 1,
    prompt: newForm.prompt
  }

  if (newForm.type === 'choice') {
    q.typeName = 'ปรนัย (Multiple Choice)'
    q.choices = JSON.parse(JSON.stringify(newForm.choices))
    q.shuffleChoices = true
  } else if (newForm.type === 'short_answer') {
    q.typeName = 'ตอบสั้น (Short Answer)'
    q.acceptableKeys = [...newForm.acceptableKeys]
    q.caseInsensitive = true
  } else if (newForm.type === 'essay') {
    q.typeName = 'เขียนบรรยาย (Essay with Rubric)'
    q.rubrics = [
      {
        id: `r_${Date.now()}_1`,
        name: 'เกณฑ์ที่ 1',
        title: 'ความถูกต้องของเนื้อหา',
        desc: 'อธิบายหลักการถูกต้องตรงตามวัตถุประสงค์',
        score: Number(newForm.score) || 1
      }
    ]
  } else if (newForm.type === 'true_false') {
    q.typeName = 'ถูก / ผิด (True / False)'
    q.choices = [
      { id: 'tf_1', label: '✓', text: 'ถูกต้อง (True)', isCorrect: newForm.tfCorrect === true },
      { id: 'tf_2', label: '✕', text: 'ผิด (False)', isCorrect: newForm.tfCorrect === false }
    ]
  }

  questions.value.push(q)
  resetNewForm()
  handleAutoSave()
  setTimeout(() => scrollToBuilder(), 100)
}

const resetNewForm = () => {
  newForm.prompt = ''
  newForm.score = 1
  newForm.choices = [
    { id: 'c1', label: 'ก.', text: '', isCorrect: true },
    { id: 'c2', label: 'ข.', text: '', isCorrect: false },
    { id: 'c3', label: 'ค.', text: '', isCorrect: false },
    { id: 'c4', label: 'ง.', text: '', isCorrect: false }
  ]
}

const scrollToIndex = (idx) => {
  const el = questionRefs.value[idx]
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const scrollToBuilder = () => {
  if (builderRef.value) builderRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

onMounted(async () => {
  // Populate from query params if passed from Exam Bank
  if (route.query.title) {
    metadata.title = String(route.query.title)
  }
  if (route.query.course) {
    metadata.subjectCode = String(route.query.course).split(' ')[0] || metadata.subjectCode
  }
  if (route.query.duration) {
    metadata.durationMinutes = Number(route.query.duration) || metadata.durationMinutes
  }
  if (route.query.score) {
    metadata.targetScore = Number(route.query.score) || metadata.targetScore
  }

  // If exam ID is provided, try loading real data from backend
  if (route.query.id && typeof route.query.id === 'string' && route.query.id.length > 10) {
    try {
      const remoteExam = await examService.getExamDetail(route.query.id)
      if (remoteExam) {
        metadata.title = remoteExam.title || metadata.title
        metadata.durationMinutes = remoteExam.timeLimitMinutes || metadata.durationMinutes
        if (remoteExam.questions && remoteExam.questions.length > 0) {
          questions.value = remoteExam.questions.map((q, idx) => ({
            id: q.id,
            type: q.type === 'MULTIPLE_CHOICE' ? 'choice' : q.type === 'SHORT_ANSWER' ? 'short_answer' : 'essay',
            typeName: q.type === 'MULTIPLE_CHOICE' ? 'ปรนัย (Multiple Choice)' : q.type === 'SHORT_ANSWER' ? 'ตอบสั้น (Short Answer)' : 'เขียนบรรยาย (Essay with Rubric)',
            score: q.points || 1,
            prompt: q.prompt,
            choices: q.choices?.map((c) => ({
              id: c.id,
              label: c.label || thaiLabels[idx] || 'ก.',
              text: c.text,
              isCorrect: !!c.isCorrect
            })),
            acceptableKeys: q.referenceText ? [q.referenceText] : ['คำตอบ'],
            caseInsensitive: true
          }))
        }
      }
    } catch (err) {
      console.warn('Backend load note:', err.message)
    }
  }
})

const handleAutoSave = () => {
  metadata.lastSavedText = 'บันทึกร่างอัตโนมัติเมื่อสักครู่'
}

const handlePublish = async () => {
  try {
    const examId = route.query.id
    if (examId && typeof examId === 'string' && examId.length > 10) {
      await examService.publishExam(examId)
    } else {
      // Create new exam on backend
      const created = await examService.createExam({
        title: metadata.title,
        timeLimitMinutes: metadata.durationMinutes
      })
      if (created?.id) {
        // Save questions
        for (const q of questions.value) {
          const type = q.type === 'choice' || q.type === 'true_false'
            ? 'MULTIPLE_CHOICE'
            : q.type === 'short_answer'
              ? 'SHORT_ANSWER'
              : 'LONG_ANSWER'
          await examService.addQuestion(created.id, {
            type,
            prompt: q.prompt,
            points: Number(q.score) || 1,
            choices: q.choices?.map((c, i) => ({
              label: c.label || thaiLabels[i] || 'ก.',
              text: c.text,
              isCorrect: !!c.isCorrect,
              order: i
            }))
          })
        }
        await examService.publishExam(created.id)
      }
    }
    alert(`บันทึกและเผยแพร่ชุดข้อสอบ "${metadata.title}" เรียบร้อยแล้ว!\nจำนวนข้อสอบ: ${questions.value.length} ข้อ\nคะแนนรวม: ${currentTotalScore.value}/${metadata.targetScore} คะแนน`)
    router.push('/teacher/exams')
  } catch (err) {
    alert(`เกิดข้อผิดพลาดในการเผยแพร่ชุดข้อสอบ: ${err.message || 'กรุณาตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง'}`)
  }
}

const handleAdvancedSettings = () => {
  alert('เปิดหน้าต่างการตั้งค่าขั้นสูง (Security, Time Limit, IP Restriction)')
}

const handleEditRubric = () => {
  alert('เปิดหน้าต่างแก้ไขเกณฑ์การให้คะแนนรูบริก (Rubric Editor)')
}

const handleImportFile = () => {
  alert('เปิดหน้าต่างนำเข้าข้อสอบจากไฟล์ Word (.docx), Excel (.xlsx), หรือ CSV')
}

const handleImportBank = () => {
  alert('เปิดหน้าต่างเลือกข้อสอบจากคลังข้อสอบกลาง (Question Bank)')
}
</script>

<style scoped src="@/assets/styles/views/teacher-exam-builder.css"></style>

