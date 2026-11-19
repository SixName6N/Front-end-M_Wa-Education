<template>
  <TeacherLayout active-tab="exams">
    <div class="eb-page">
      <!-- TOP CONTEXT / HEADER BAR -->
      <section class="eb-top-bar">
        <!-- Breadcrumb -->
        <nav aria-label="Breadcrumb" class="eb-breadcrumb">
          <router-link to="/teacher/exams" class="eb-breadcrumb__link">คลังข้อสอบ</router-link>
          <span class="material-symbols-outlined eb-breadcrumb__sep">chevron_right</span>
          <span class="eb-breadcrumb__current">{{ metadata.title || 'สร้างชุดข้อสอบใหม่' }}</span>
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
                @change="handleAutoSave()"
              />
              <span class="material-symbols-outlined eb-title-edit-icon">edit</span>
            </div>

            <!-- Metadata Tags -->
            <div class="eb-meta-tags">
              <span v-if="metadata.subjectCode" class="eb-tag eb-tag--pill">
                <span class="material-symbols-outlined eb-tag-icon">tag</span>
                รหัสวิชา {{ metadata.subjectCode }}
              </span>
              <template v-if="metadata.semester">
                <span v-if="metadata.subjectCode" class="eb-dot">•</span>
                <span>{{ metadata.semester }}</span>
              </template>
              <template v-if="metadata.targetScore">
                <span class="eb-dot">•</span>
                <span class="eb-tag-target">เป้าหมาย {{ metadata.targetScore }} คะแนน</span>
              </template>
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
              :disabled="publishBusy"
              @click="handlePublish"
            >
              <span class="material-symbols-outlined">publish</span>
              <span>{{ publishBusy ? 'กำลังเผยแพร่...' : 'บันทึกและเผยแพร่' }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- MAIN SPLIT WORKSPACE GRID -->
      <div class="eb-workspace-grid">
        <!-- LEFT: QUESTIONS EDITOR (8 Cols) -->
        <div class="eb-main-col">
          <!-- Builder Inline Feedback Alert -->
          <div
            v-if="builderFeedback.message"
            class="eb-import-alert"
            :class="`eb-import-alert--${builderFeedback.type}`"
            role="alert"
          >
            <span class="material-symbols-outlined text-[18px]">
              {{ builderFeedback.type === 'error' ? 'error' : (builderFeedback.type === 'success' ? 'check_circle' : 'info') }}
            </span>
            <p style="flex: 1;">{{ builderFeedback.message }}</p>
            <button
              type="button"
              style="background:none; border:none; cursor:pointer; color:inherit; font-weight:bold; font-size:14px;"
              @click="builderFeedback.message = ''"
            >
              ✕
            </button>
          </div>

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
                      @change="handleAutoSave(question)"
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
                    @change="handleAutoSave(question)"
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

            <!-- Builder validation error -->
            <div v-if="newFormError" class="eb-import-alert eb-import-alert--error" style="margin-bottom: 12px;">
              <span class="material-symbols-outlined text-[18px]">error</span>
              <p>{{ newFormError }}</p>
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
              <button type="button" class="eb-side-link" @click="openSettings">ตั้งค่า / มอบหมาย</button>
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
                <span class="eb-side-row-val">{{ targetGroupText }}</span>
              </div>

              <!-- Grade cutoffs summary -->
              <div class="eb-side-row">
                <div class="eb-side-row-label">
                  <span class="material-symbols-outlined text-[18px]">grade</span>
                  <span>เกณฑ์ตัดเกรด</span>
                </div>
                <span class="eb-side-row-text">{{ cutoffsText }}</span>
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

      <!-- EXAM SETTINGS MODAL (metadata / IP / assignments / cutoffs) -->
      <div v-if="showSettings" class="eb-modal-backdrop" @click.self="closeSettings">
        <div class="eb-modal-box eb-settings-modal">
          <div class="eb-modal-top">
            <div>
              <h3 class="eb-modal-heading">ตั้งค่าชุดข้อสอบ</h3>
              <p class="eb-modal-sub">
                เวลาสอบ • จำกัด IP • ห้องเรียนที่มอบหมาย • เกณฑ์ตัดเกรด
              </p>
            </div>
            <button type="button" class="eb-icon-btn" :disabled="settingsBusy" @click="closeSettings">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="eb-modal-scroll">
            <div v-if="settingsError" class="eb-import-alert eb-import-alert--error">
              <span class="material-symbols-outlined text-[18px]">error</span>
              <p>{{ settingsError }}</p>
            </div>
            <div v-if="settingsSuccess" class="eb-import-alert eb-import-alert--success">
              <span class="material-symbols-outlined text-[18px]">check_circle</span>
              <p>{{ settingsSuccess }}</p>
            </div>

            <!-- 1) ข้อมูลชุดข้อสอบ -->
            <section class="eb-set-section">
              <h4 class="eb-set-title">
                <span class="material-symbols-outlined text-[18px]">tune</span>
                ข้อมูลชุดข้อสอบ
              </h4>

              <div class="eb-set-field">
                <label for="set_description">คำอธิบายชุดข้อสอบ</label>
                <textarea
                  id="set_description"
                  v-model="settingsForm.description"
                  class="eb-set-textarea"
                  rows="2"
                  placeholder="คำแนะนำก่อนเริ่มทำข้อสอบ (ไม่บังคับ)"
                ></textarea>
              </div>

              <div class="eb-set-grid">
                <div class="eb-set-field">
                  <label for="set_duration">เวลาทำข้อสอบ (นาที)</label>
                  <input
                    id="set_duration"
                    v-model.number="metadata.durationMinutes"
                    type="number"
                    min="1"
                    max="1440"
                    class="eb-set-input"
                  />
                </div>

                <div class="eb-set-field">
                  <label for="set_mode">รูปแบบการแสดงข้อสอบ</label>
                  <select id="set_mode" v-model="settingsForm.defaultDisplayMode" class="eb-set-input">
                    <option value="SINGLE_PAGE">แสดงทุกข้อในหน้าเดียว</option>
                    <option value="PAGINATED">แบ่งหน้า (PAGINATED)</option>
                  </select>
                </div>

                <div class="eb-set-field">
                  <label for="set_per_page">จำนวนข้อต่อหน้า</label>
                  <input
                    id="set_per_page"
                    v-model.number="settingsForm.questionsPerPage"
                    type="number"
                    min="1"
                    max="100"
                    class="eb-set-input"
                  />
                </div>
              </div>
            </section>

            <!-- 2) จำกัด IP -->
            <section class="eb-set-section">
              <h4 class="eb-set-title">
                <span class="material-symbols-outlined text-[18px]">shield</span>
                จำกัด IP ที่อนุญาตให้เข้าสอบ
              </h4>
              <p class="eb-set-hint">
                ใส่ IP หรือ CIDR ได้ บรรทัดละ 1 ค่า • เว้นว่าง = ไม่จำกัด (นักเรียนเข้าสอบได้จากทุกเครือข่าย)
              </p>
              <textarea
                v-model="settingsForm.allowedIpRangesText"
                class="eb-set-textarea"
                rows="3"
                placeholder="เช่น 192.168.1.0/24&#10;10.0.0.5"
              ></textarea>
              <div class="eb-set-inline">
                <span class="eb-set-ip">IP ปัจจุบันของคุณ: <strong>{{ requestIp || '—' }}</strong></span>
                <button type="button" class="eb-btn eb-btn--secondary eb-btn--sm" @click="useCurrentIp">
                  <span class="material-symbols-outlined text-[16px]">my_location</span>
                  ใช้ IP นี้
                </button>
              </div>
            </section>

            <!-- 3) มอบหมายห้องเรียน -->
            <section class="eb-set-section">
              <h4 class="eb-set-title">
                <span class="material-symbols-outlined text-[18px]">groups</span>
                ห้องเรียนที่มอบหมาย (ต้องมีอย่างน้อย 1 ห้องก่อนเผยแพร่)
              </h4>

              <ul v-if="assignments.length" class="eb-set-list">
                <li v-for="a in assignments" :key="a.id" class="eb-set-list-item">
                  <span class="eb-set-list-name">
                    {{ a.classroomName }}
                    <span v-if="a.studentCount !== null" class="eb-set-list-count">
                      {{ a.studentCount }} คน
                    </span>
                  </span>
                  <button
                    type="button"
                    class="eb-icon-btn eb-icon-btn--danger"
                    title="ยกเลิกการมอบหมาย"
                    :disabled="settingsBusy"
                    @click="removeAssignment(a)"
                  >
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </li>
              </ul>
              <p v-else class="eb-set-hint">ยังไม่ได้มอบหมายห้องเรียนใดเลย</p>

              <div class="eb-set-grid eb-set-grid--assign">
                <div class="eb-set-field">
                  <label for="set_room">เพิ่มห้องเรียน</label>
                  <select
                    id="set_room"
                    v-model="newAssignment.classroomId"
                    class="eb-set-input"
                    :disabled="loadingClassrooms || assignableClassrooms.length === 0"
                  >
                    <option value="">
                      {{ loadingClassrooms ? 'กำลังโหลด...' : assignableClassrooms.length === 0 ? 'ไม่มีห้องที่เพิ่มได้' : 'เลือกห้องเรียน' }}
                    </option>
                    <option v-for="room in assignableClassrooms" :key="room.id" :value="room.id">
                      {{ room.name }}
                    </option>
                  </select>
                </div>
                <div class="eb-set-field">
                  <label for="set_from">เปิดให้สอบตั้งแต่</label>
                  <input id="set_from" v-model="newAssignment.availableFrom" type="datetime-local" class="eb-set-input" />
                </div>
                <div class="eb-set-field">
                  <label for="set_to">ปิดการสอบ</label>
                  <input id="set_to" v-model="newAssignment.availableTo" type="datetime-local" class="eb-set-input" />
                </div>
                <button
                  type="button"
                  class="eb-btn eb-btn--primary eb-btn--sm eb-set-assign-btn"
                  :disabled="settingsBusy || !newAssignment.classroomId"
                  @click="addAssignment"
                >
                  <span class="material-symbols-outlined text-[16px]">add</span>
                  มอบหมาย
                </button>
              </div>
            </section>

            <!-- 4) เกณฑ์ตัดเกรด -->
            <section class="eb-set-section">
              <h4 class="eb-set-title">
                <span class="material-symbols-outlined text-[18px]">grade</span>
                เกณฑ์ตัดเกรด (คิดเป็นเปอร์เซ็นต์)
              </h4>

              <div class="eb-cutoff-list">
                <div v-for="(c, i) in cutoffs" :key="i" class="eb-cutoff-row">
                  <input v-model="c.grade" type="text" class="eb-set-input eb-cutoff-grade" placeholder="เกรด" />
                  <div class="eb-cutoff-percent">
                    <input
                      v-model.number="c.minPercent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      class="eb-set-input"
                    />
                    <span>%</span>
                  </div>
                  <button type="button" class="eb-icon-btn eb-icon-btn--danger" title="ลบเกณฑ์" @click="removeCutoffRow(i)">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>

              <div class="eb-set-inline">
                <button type="button" class="eb-btn eb-btn--ghost eb-btn--sm" @click="addCutoffRow">
                  <span class="material-symbols-outlined text-[16px]">add</span>
                  เพิ่มเกณฑ์
                </button>
                <button type="button" class="eb-btn eb-btn--secondary eb-btn--sm" @click="useDefaultCutoffs">
                  <span class="material-symbols-outlined text-[16px]">restart_alt</span>
                  ใช้เกณฑ์มาตรฐาน A–F
                </button>
                <button
                  type="button"
                  class="eb-btn eb-btn--primary eb-btn--sm"
                  :disabled="cutoffsBusy"
                  @click="saveCutoffs"
                >
                  <span class="material-symbols-outlined text-[16px]">save</span>
                  บันทึกเกณฑ์ตัดเกรด
                </button>
              </div>
            </section>
          </div>

          <div class="eb-modal-bottom">
            <button type="button" class="eb-btn eb-btn--secondary" :disabled="settingsBusy" @click="closeSettings">
              ปิด
            </button>
            <button type="button" class="eb-btn eb-btn--primary" :disabled="settingsBusy" @click="saveSettings">
              <span class="material-symbols-outlined text-[18px]">save</span>
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
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

      <!-- QUESTION IMPORT MODAL -->
      <div v-if="showImportModal" class="eb-modal-backdrop" @click.self="closeImportModal">
        <div class="eb-modal-box eb-import-modal">
          <div class="eb-modal-top">
            <div>
              <h3 class="eb-modal-heading">นำเข้าข้อสอบจากไฟล์ (CSV / Excel)</h3>
              <p class="eb-modal-sub">
                รองรับ .csv และ .xlsx • 1 แถว = 1 ข้อ • สูงสุด 500 ข้อ/ไฟล์ และไม่เกิน 5 MB
              </p>
            </div>
            <button type="button" class="eb-icon-btn" :disabled="importBusy" @click="closeImportModal">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="eb-modal-scroll">
            <!-- ขั้นที่ 1: ดาวน์โหลดแม่แบบ -->
            <div class="eb-import-step">
              <div class="eb-import-step-head">
                <span class="eb-import-step-no">1</span>
                <div class="eb-import-step-text">
                  <p class="eb-import-step-title">ดาวน์โหลดแม่แบบไฟล์</p>
                  <p class="eb-import-step-desc">เปิดด้วย Excel แล้วกรอกข้อมูล (อย่าแก้ชื่อคอลัมน์หัวตาราง)</p>
                </div>
                <button type="button" class="eb-btn eb-btn--secondary" @click="downloadImportTemplate">
                  <span class="material-symbols-outlined text-[18px]">download</span>
                  ดาวน์โหลดแม่แบบ
                </button>
              </div>
            </div>

            <!-- ขั้นที่ 2: เลือกไฟล์ -->
            <div class="eb-import-step">
              <div class="eb-import-step-head">
                <span class="eb-import-step-no">2</span>
                <div class="eb-import-step-text">
                  <p class="eb-import-step-title">เลือกไฟล์ข้อสอบ</p>
                  <p class="eb-import-step-desc">ไฟล์ .csv ต้องบันทึกเป็น UTF-8 (เพื่อให้อ่านภาษาไทยได้)</p>
                </div>
              </div>
              <label class="eb-import-dropzone">
                <input
                  ref="importInputRef"
                  type="file"
                  accept=".csv,.xlsx"
                  class="eb-import-input"
                  @change="onImportFileChange"
                />
                <span class="material-symbols-outlined eb-import-dropzone-icon">upload_file</span>
                <span v-if="importFileName" class="eb-import-filename">{{ importFileName }}</span>
                <span v-else class="eb-import-dropzone-hint">คลิกเพื่อเลือกไฟล์ (.csv / .xlsx)</span>
              </label>
            </div>

            <!-- error -->
            <div v-if="importError" class="eb-import-alert eb-import-alert--error">
              <span class="material-symbols-outlined text-[18px]">error</span>
              <div>
                <p>{{ importError }}</p>
                <ul v-if="importRowErrors.length" class="eb-import-error-list">
                  <li v-for="(row, i) in importRowErrors" :key="i">
                    แถว {{ row.row ?? row.line ?? '?' }}: {{ row.message }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- preview (dryRun) -->
            <div v-if="importPreview" class="eb-import-preview">
              <div class="eb-modal-summary">
                <span>พร้อมนำเข้า: <strong>{{ importPreview.wouldImport }} ข้อ</strong></span>
                <span>คะแนนที่จะเพิ่ม: <strong>{{ importPreview.incomingPoints }} คะแนน</strong></span>
                <span>คะแนนเต็มหลังนำเข้า: <strong>{{ importPreview.totalsPointsAfter }}</strong></span>
              </div>
              <ol class="eb-import-preview-list">
                <li v-for="p in importPreview.preview" :key="p.index">
                  <span class="eb-import-preview-type">{{ importPreviewTypeLabel(p.type) }}</span>
                  <span class="eb-import-preview-prompt">{{ p.prompt }}</span>
                  <span class="eb-import-preview-points">{{ Number(p.points).toFixed(1) }} คะแนน</span>
                </li>
              </ol>
            </div>

            <!-- success -->
            <div v-if="importResult" class="eb-import-alert eb-import-alert--success">
              <span class="material-symbols-outlined text-[18px]">check_circle</span>
              <p>
                นำเข้าสำเร็จ {{ importResult.imported }} ข้อ — ตอนนี้ชุดนี้มีคะแนนเต็ม
                {{ importResult.totalsPoints }} คะแนน
              </p>
            </div>
          </div>

          <div class="eb-modal-bottom eb-import-actions">
            <p class="eb-import-note">
              นำเข้าได้เฉพาะชุดสถานะ “ฉบับร่าง” — ระบบจะบันทึกชุดข้อสอบให้ก่อนอัตโนมัติ
            </p>
            <div class="eb-import-action-btns">
              <button
                type="button"
                class="eb-btn eb-btn--secondary"
                :disabled="importBusy || !importFile"
                @click="previewImport"
              >
                <span class="material-symbols-outlined text-[18px]">visibility</span>
                พรีวิว (ยังไม่บันทึก)
              </button>
              <button
                type="button"
                class="eb-btn eb-btn--primary"
                :disabled="importBusy || !importFile"
                @click="confirmImport"
              >
                <span class="material-symbols-outlined text-[18px]">upload</span>
                {{ importBusy ? 'กำลังทำงาน…' : 'นำเข้าจริง' }}
              </button>
            </div>
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
import { studentService } from '@/services/studentService'
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

// ---- สถานะการนำเข้าข้อสอบจากไฟล์ ----
// draftExamId = ชุดข้อสอบที่ผูกอยู่กับหน้าจอนี้ (มีค่าเมื่อแก้ชุดเดิม หรือหลังบันทึกฉบับร่างครั้งแรก)
const draftExamId = ref(
  typeof route.query.id === 'string' && route.query.id.length > 10 ? route.query.id : null
)
// questionsPersisted = ข้อสอบบนหน้าจอถูกบันทึกใน DB แล้วหรือยัง (กัน publish ซ้ำ)
const questionsPersisted = ref(Boolean(draftExamId.value))
const builderFeedback = reactive({ message: '', type: 'error' })
const newFormError = ref('')

const showImportModal = ref(false)
const importInputRef = ref(null)
const importFile = ref(null)
const importFileName = ref('')
const importBusy = ref(false)
const importError = ref('')
const importRowErrors = ref([])
const importPreview = ref(null)
const importResult = ref(null)

// ---- สถานะหน้าต่างตั้งค่าชุดข้อสอบ (Exam Rules / Assignments / Cutoffs) ----
const showSettings = ref(false)
const settingsBusy = ref(false)
const settingsError = ref('')
const settingsSuccess = ref('')

const settingsForm = reactive({
  description: '',
  defaultDisplayMode: 'SINGLE_PAGE',
  questionsPerPage: 10,
  allowedIpRangesText: ''
})

const requestIp = ref('')
const classrooms = ref([])
const loadingClassrooms = ref(false)
const assignments = ref([])
const newAssignment = reactive({
  classroomId: '',
  availableFrom: '',
  availableTo: ''
})
const cutoffs = ref([])
const cutoffsBusy = ref(false)

const typeOptions = QUESTION_TYPES
const thaiLabels = ['ก.', 'ข.', 'ค.', 'ง.', 'จ.', 'ฉ.']

const newForm = reactive({
  type: 'choice',
  score: 1,
  prompt: '',
  explanation: '',
  choices: [
    { id: 'c1', label: 'ก.', text: '', isCorrect: true },
    { id: 'c2', label: 'ข.', text: '', isCorrect: false },
    { id: 'c3', label: 'ค.', text: '', isCorrect: false },
    { id: 'c4', label: 'ง.', text: '', isCorrect: false }
  ],
  acceptableKeys: [],
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

/** สรุปกลุ่มผู้มีสิทธิ์สอบจากรายการที่มอบหมายจริง */
const targetGroupText = computed(() =>
  assignments.value.length === 0
    ? 'ยังไม่ได้มอบหมายห้องเรียน'
    : `${assignments.value.length} ห้องเรียน`
)

/** สรุปเกณฑ์ตัดเกรด */
const cutoffsText = computed(() =>
  cutoffs.value.length === 0
    ? 'ยังไม่ได้กำหนด (ใช้ A–F มาตรฐาน)'
    : `${cutoffs.value.length} ระดับ`
)

const moveQuestion = async (index, direction) => {
  const target = index + direction
  if (target < 0 || target >= questions.value.length) return
  const item = questions.value.splice(index, 1)[0]
  questions.value.splice(target, 0, item)
  await syncQuestionOrder()
}

const copyQuestion = async (index) => {
  const source = questions.value[index]
  const clone = JSON.parse(JSON.stringify(source))
  clone.id = Date.now()
  clone.remoteId = null
  if (Array.isArray(clone.choices)) {
    clone.choices = clone.choices.map((c, i) => ({ ...c, id: `c_${clone.id}_${i}` }))
  }
  clone.prompt = `${clone.prompt} (สำเนา)`
  questions.value.splice(index + 1, 0, clone)

  try {
    const examId = await ensureDraftExam()
    const created = await persistQuestion(examId, clone)
    if (created?.id) clone.remoteId = created.id
    await syncQuestionOrder()
    builderFeedback.message = ''
  } catch (err) {
    console.error('รายละเอียดข้อผิดพลาดคัดลอกข้อสอบ (Console Only):', err.technical || err.message || err)
    builderFeedback.message = 'คัดลอกข้อสอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
    builderFeedback.type = 'error'
  }
}

const deleteQuestion = async (index) => {
  const question = questions.value[index]
  if (!confirm(`คุณต้องการลบข้อสอบข้อที่ ${index + 1} หรือไม่?`)) return

  questions.value.splice(index, 1)

  try {
    if (draftExamId.value && question?.remoteId) {
      await examService.deleteQuestion(draftExamId.value, question.remoteId)
    }
    await syncQuestionOrder()
    metadata.lastSavedText = 'ลบข้อสอบแล้ว'
    builderFeedback.message = ''
  } catch (err) {
    console.error('รายละเอียดข้อผิดพลาดลบข้อสอบ (Console Only):', err.technical || err.message || err)
    builderFeedback.message = 'ลบข้อสอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
    builderFeedback.type = 'error'
  }
}

const toggleExplanation = (id) => {
  activeExplanations[id] = !activeExplanations[id]
}

const addAlternateKey = (question) => {
  const key = prompt('ระบุคำตอบสำรองที่ยอมรับ:')
  if (key && key.trim()) {
    question.acceptableKeys.push(key.trim())
    handleAutoSave(question)
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

const saveNewQuestionToSet = async () => {
  if (!newForm.prompt.trim()) {
    newFormError.value = 'กรุณากรอกข้อความโจทย์ข้อสอบ'
    return
  }
  newFormError.value = ''

  const q = {
    id: Date.now(),
    remoteId: null,
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

  try {
    const examId = await ensureDraftExam()
    const created = await persistQuestion(examId, q)
    if (created?.id) q.remoteId = created.id
    await syncQuestionOrder()
    metadata.lastSavedText = 'บันทึกข้อสอบใหม่แล้ว'
    builderFeedback.message = ''
  } catch (err) {
    console.error('รายละเอียดข้อผิดพลาดบันทึกข้อสอบ (Console Only):', err.technical || err.message || err)
    builderFeedback.message = 'บันทึกข้อสอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
    builderFeedback.type = 'error'
  }

  setTimeout(() => scrollToBuilder(), 100)
}

const resetNewForm = () => {
  newFormError.value = ''
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
      applyExamDetail(remoteExam)
      questionsPersisted.value = true
    } catch (err) {
      console.error('รายละเอียดข้อผิดพลาดโหลดชุดข้อสอบ (Console Only):', err)
      builderFeedback.message = `โหลดข้อมูลชุดข้อสอบไม่สำเร็จ: ${err.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้'}`
      builderFeedback.type = 'error'
    }
  }

  // มาจากปุ่ม "นำเข้า" ในหน้าคลังข้อสอบ → เปิดโมดัลนำเข้าให้เลย
  if (route.query.import === '1') {
    handleImportFile()
  }
})

// ---------------------------------------------------------------------------
// นำเข้าข้อสอบจากไฟล์ (CSV / Excel)
// ---------------------------------------------------------------------------

const IMPORT_TYPE_LABELS = {
  MULTIPLE_CHOICE: 'ปรนัย',
  SHORT_ANSWER: 'ตอบสั้น',
  LONG_ANSWER: 'บรรยาย'
}

const importPreviewTypeLabel = (type) => IMPORT_TYPE_LABELS[type] ?? type

/** แปลงคำถามจาก backend → รูปแบบที่หน้าจอใช้ */
const mapRemoteQuestion = (q, idx) => ({
  id: q.id,
  remoteId: q.id,
  type: q.type === 'MULTIPLE_CHOICE' ? 'choice' : q.type === 'SHORT_ANSWER' ? 'short_answer' : 'essay',
  typeName:
    q.type === 'MULTIPLE_CHOICE'
      ? 'ปรนัย (Multiple Choice)'
      : q.type === 'SHORT_ANSWER'
        ? 'ตอบสั้น (Short Answer)'
        : 'เขียนบรรยาย (Essay with Rubric)',
  score: Number(q.points) || 1,
  prompt: q.prompt,
  explanation: q.explanation ?? '',
  choices: q.choices?.map((c) => ({
    id: c.id,
    label: c.label || thaiLabels[idx] || 'ก.',
    text: c.text,
    isCorrect: !!c.isCorrect
  })),
  acceptableKeys: q.referenceText
    ? String(q.referenceText)
        .split('\n')
        .map((k) => k.trim())
        .filter(Boolean)
    : ['คำตอบ'],
  caseInsensitive: true
})

const localQuestionType = (q) =>
  q.type === 'choice' || q.type === 'true_false'
    ? 'MULTIPLE_CHOICE'
    : q.type === 'short_answer'
      ? 'SHORT_ANSWER'
      : 'LONG_ANSWER'

/** ร่าง payload คำถามจากหน้าจอ → รูปแบบที่ backend รับ */
const buildQuestionPayload = (q) => ({
  type: localQuestionType(q),
  prompt: q.prompt,
  points: Number(q.score) || 1,
  explanation: q.explanation ? String(q.explanation).trim() : null,
  ...(q.type === 'short_answer'
    ? { referenceText: (q.acceptableKeys ?? []).join('\n') || null }
    : {}),
  ...(q.choices
    ? {
        choices: q.choices.map((c, i) => ({
          label: c.label || thaiLabels[i] || 'ก.',
          text: c.text,
          isCorrect: !!c.isCorrect,
          order: i
        }))
      }
    : {})
})

/** บันทึกคำถามใหม่ 1 ข้อจากหน้าจอลง DB (คืน object ที่ backend สร้าง) */
const persistQuestion = async (examId, q) => {
  const created = await examService.addQuestion(examId, buildQuestionPayload(q))
  if (created?.id) q.remoteId = created.id
  return created
}

/** อัปเดตคำถามเดิมที่บันทึกแล้ว (แก้คะแนน/โจทย์/เฉลย) */
const persistQuestionPatch = (examId, q) => {
  if (!q?.remoteId) return Promise.resolve(null)
  return examService.updateQuestion(examId, q.remoteId, buildQuestionPayload(q))
}

/** บันทึกคำถามทุกข้อที่ยังไม่มี id ฝั่ง backend */
const flushUnpersistedQuestions = async (examId) => {
  for (const q of questions.value) {
    if (!q.remoteId) await persistQuestion(examId, q)
  }
}

/** ส่งลำดับข้อสอบปัจจุบันให้ backend (เฉพาะข้อที่บันทึกแล้ว) */
const syncQuestionOrder = async () => {
  if (!draftExamId.value) return
  const items = questions.value
    .map((q, index) => (q.remoteId ? { id: q.remoteId, order: index } : null))
    .filter(Boolean)
  if (items.length === 0) return
  try {
    await examService.reorderQuestions(draftExamId.value, items)
  } catch (err) {
    console.warn('จัดลำดับข้อสอบไม่สำเร็จ:', err.message)
  }
}

/** payload ตั้งค่าชุดข้อสอบ (metadata) ที่ผูกกับ schema จริง */
const buildExamPayload = () => ({
  title: (metadata.title || '').trim() || 'ชุดข้อสอบใหม่',
  description: settingsForm.description?.trim() ? settingsForm.description.trim() : null,
  timeLimitMinutes: Number(metadata.durationMinutes) || null,
  defaultDisplayMode: settingsForm.defaultDisplayMode,
  questionsPerPage: Number(settingsForm.questionsPerPage) || 10,
  allowedIpRanges: parseIpLines(settingsForm.allowedIpRangesText)
})

/** แยก IP/CIDR จาก textarea (บรรทัดละ 1 ค่า) */
function parseIpLines(text) {
  return String(text ?? '')
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter(Boolean)
}

/** นำรายละเอียดชุดข้อสอบจาก backend มาเติมลงหน้าจอ/หน้าตั้งค่า */
const applyExamDetail = (remote) => {
  if (!remote) return

  metadata.title = remote.title || metadata.title
  if (remote.timeLimitMinutes) metadata.durationMinutes = remote.timeLimitMinutes

  settingsForm.description = remote.description ?? ''
  settingsForm.defaultDisplayMode = remote.defaultDisplayMode || 'SINGLE_PAGE'
  settingsForm.questionsPerPage = remote.questionsPerPage || 10
  settingsForm.allowedIpRangesText = (remote.allowedIpRanges ?? []).join('\n')

  assignments.value = (remote.assignments ?? []).map((item) => ({
    id: item.id,
    classroomId: item.classroomId ?? item.classroom?.id,
    classroomName: item.classroom?.name ?? '—',
    studentCount: item.classroom?._count?.enrollments ?? null,
    availableFrom: item.availableFrom ?? null,
    availableTo: item.availableTo ?? null
  }))

  cutoffs.value = (remote.cutoffs ?? []).map((c) => ({
    grade: c.grade,
    minPercent: Number(c.minPercent)
  }))

  if (Array.isArray(remote.questions)) {
    questions.value = remote.questions.map(mapRemoteQuestion)
  }
}

/**
 * ตรวจว่ามีชุดข้อสอบให้ผูกแล้วหรือยัง — ถ้ายัง จะสร้างเป็น "ฉบับร่าง" พร้อมบันทึกคำถามบนหน้าจอลง DB ก่อน
 * (มอบหมายห้องเรียน/นำเข้าไฟล์/เผยแพร่ ทำได้เฉพาะชุดสถานะ DRAFT จึงต้องมีชุดข้อสอบก่อน)
 */
const ensureDraftExam = async () => {
  if (draftExamId.value) return draftExamId.value

  const created = await examService.createExam(buildExamPayload())
  if (!created?.id) throw new Error('บันทึกชุดข้อสอบฉบับร่างไม่สำเร็จ')

  draftExamId.value = created.id
  router.replace({ query: { ...route.query, id: created.id } })

  await flushUnpersistedQuestions(created.id)
  questionsPersisted.value = true

  return created.id
}

/** ดึงคำถามล่าสุดจาก backend มาแทนที่รายการบนหน้าจอ */
const reloadQuestionsFromServer = async (examId) => {
  const remote = await examService.getExamDetail(examId)
  applyExamDetail(remote)
}

// ---------------------------------------------------------------------------
// บันทึกร่างอัตโนมัติ (metadata + คำถามที่แก้)
// ---------------------------------------------------------------------------

let autoSaveTimer = null
let activeAutoSavePromise = null
const pendingQuestionPatches = new Set()

const queueAutoSave = (question = null) => {
  if (question?.remoteId) pendingQuestionPatches.add(question)
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(runAutoSave, 800)
}

const runAutoSave = async () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = null
  }

  // ถ้าระหว่างนี้มี request บันทึกที่กำลังทำงานอยู่ ให้รอจนเสร็จสิ้นก่อน
  if (activeAutoSavePromise) {
    try {
      await activeAutoSavePromise
    } catch {
      // รอให้เสร็จ แล้วจัดการคิวที่เหลือ
    }
  }

  if (!draftExamId.value) {
    metadata.lastSavedText = 'ยังไม่ได้บันทึก — ระบบจะบันทึกเมื่อเพิ่มข้อสอบ'
    return true
  }

  const examId = draftExamId.value
  const patches = [...pendingQuestionPatches]
  pendingQuestionPatches.clear()

  activeAutoSavePromise = (async () => {
    try {
      await examService.updateExam(examId, buildExamPayload())
      for (const q of patches) {
        await persistQuestionPatch(examId, q)
      }
      metadata.lastSavedText = `บันทึกล่าสุด ${new Date().toLocaleTimeString('th-TH')}`
      return true
    } catch (err) {
      // นำรายการที่ยังบันทึกไม่ผ่านกลับเข้า pending เพื่อไม่ให้ข้อมูลสูญหาย และสามารถ retry ได้
      patches.forEach((p) => pendingQuestionPatches.add(p))
      metadata.lastSavedText = `บันทึกอัตโนมัติไม่สำเร็จ: ${err.message}`
      console.error('รายละเอียดข้อผิดพลาดบันทึกอัตโนมัติ (Console Only):', err)
      throw err
    } finally {
      activeAutoSavePromise = null
    }
  })()

  return activeAutoSavePromise
}

/** เรียกจากหน้าจอเมื่อแก้ไขค่าที่ต้องบันทึก (โจทย์/คะแนน/metadata) */
const handleAutoSave = (question = null) => {
  metadata.lastSavedText = 'กำลังบันทึก...'
  queueAutoSave(question)
}

// ---------------------------------------------------------------------------
// ตั้งค่าชุดข้อสอบ: metadata / IP / มอบหมายห้องเรียน / เกณฑ์ตัดเกรด
// ---------------------------------------------------------------------------

const openSettings = async () => {
  showSettings.value = true
  settingsError.value = ''
  settingsSuccess.value = ''

  if (draftExamId.value) {
    try {
      const detail = await examService.getExamDetail(draftExamId.value)
      applyExamDetail(detail)
    } catch (err) {
      settingsError.value = err.message || 'โหลดการตั้งค่าไม่สำเร็จ'
    }
  } else if (cutoffs.value.length === 0) {
    await useDefaultCutoffs()
  }

  await loadClassrooms()
  await loadRequestIp()
}

const closeSettings = () => {
  if (settingsBusy.value || cutoffsBusy.value) return
  showSettings.value = false
}

const loadRequestIp = async () => {
  try {
    const info = await examService.getRequestIp()
    requestIp.value = info?.normalizedIp || info?.ip || ''
  } catch {
    requestIp.value = ''
  }
}

const useCurrentIp = () => {
  if (!requestIp.value) return
  const lines = parseIpLines(settingsForm.allowedIpRangesText)
  if (!lines.includes(requestIp.value)) lines.push(requestIp.value)
  settingsForm.allowedIpRangesText = lines.join('\n')
}

const loadClassrooms = async () => {
  loadingClassrooms.value = true
  try {
    classrooms.value = await studentService.listClassrooms()
  } catch (err) {
    settingsError.value = err.message || 'โหลดรายการห้องเรียนไม่สำเร็จ'
    classrooms.value = []
  } finally {
    loadingClassrooms.value = false
  }
}

/** ห้องเรียนที่ยังไม่ถูกมอบหมาย (สำหรับ dropdown) */
const assignableClassrooms = computed(() => {
  const assignedIds = new Set(assignments.value.map((a) => a.classroomId))
  return classrooms.value.filter((room) => !assignedIds.has(room.id))
})

const addAssignment = async () => {
  if (!newAssignment.classroomId) {
    settingsError.value = 'กรุณาเลือกห้องเรียนก่อน'
    return
  }

  settingsBusy.value = true
  settingsError.value = ''
  settingsSuccess.value = ''

  try {
    const examId = await ensureDraftExam()
    const created = await examService.assignClassroom(examId, {
      classroomId: newAssignment.classroomId,
      availableFrom: newAssignment.availableFrom
        ? new Date(newAssignment.availableFrom).toISOString()
        : null,
      availableTo: newAssignment.availableTo
        ? new Date(newAssignment.availableTo).toISOString()
        : null
    })

    assignments.value.unshift({
      id: created?.id ?? `tmp-${Date.now()}`,
      classroomId: created?.classroomId ?? created?.classroom?.id ?? newAssignment.classroomId,
      classroomName: created?.classroom?.name ?? '—',
      studentCount: null,
      availableFrom: created?.availableFrom ?? null,
      availableTo: created?.availableTo ?? null
    })

    newAssignment.classroomId = ''
    newAssignment.availableFrom = ''
    newAssignment.availableTo = ''
    settingsSuccess.value = 'มอบหมายห้องเรียนแล้ว'
  } catch (err) {
    settingsError.value = err.message || 'มอบหมายห้องเรียนไม่สำเร็จ'
  } finally {
    settingsBusy.value = false
  }
}

const removeAssignment = async (assignment) => {
  if (!draftExamId.value) return
  if (!confirm(`ยกเลิกการมอบหมายข้อสอบให้ "${assignment.classroomName}" ?`)) return

  settingsBusy.value = true
  settingsError.value = ''
  settingsSuccess.value = ''

  try {
    await examService.unassignClassroom(draftExamId.value, assignment.id)
    assignments.value = assignments.value.filter((a) => a.id !== assignment.id)
    settingsSuccess.value = 'ยกเลิกการมอบหมายแล้ว'
  } catch (err) {
    settingsError.value = err.message || 'ยกเลิกการมอบหมายไม่สำเร็จ'
  } finally {
    settingsBusy.value = false
  }
}

const useDefaultCutoffs = async () => {
  try {
    const defaults = await examService.getDefaultCutoffs()
    cutoffs.value = defaults.map((c) => ({ grade: c.grade, minPercent: Number(c.minPercent) }))
  } catch (err) {
    settingsError.value = err.message || 'โหลดเกณฑ์มาตรฐานไม่สำเร็จ'
  }
}

const addCutoffRow = () => {
  cutoffs.value.push({ grade: '', minPercent: 0 })
}

const removeCutoffRow = (index) => {
  cutoffs.value.splice(index, 1)
}

const saveCutoffs = async () => {
  const cleaned = cutoffs.value
    .map((c) => ({ grade: String(c.grade ?? '').trim(), minPercent: Number(c.minPercent) }))
    .filter((c) => c.grade)

  if (cleaned.length === 0) {
    settingsError.value = 'ต้องมีเกณฑ์อย่างน้อย 1 ระดับ'
    return
  }
  if (new Set(cleaned.map((c) => c.grade)).size !== cleaned.length) {
    settingsError.value = 'มีเกรดซ้ำกันในเกณฑ์ตัดเกรด'
    return
  }
  if (cleaned.some((c) => Number.isNaN(c.minPercent) || c.minPercent < 0 || c.minPercent > 100)) {
    settingsError.value = 'เปอร์เซ็นต์ต้องอยู่ระหว่าง 0–100'
    return
  }

  cutoffsBusy.value = true
  settingsError.value = ''
  settingsSuccess.value = ''

  try {
    const examId = await ensureDraftExam()
    const saved = await examService.replaceCutoffs(examId, cleaned)
    cutoffs.value = saved.map((c) => ({ grade: c.grade, minPercent: Number(c.minPercent) }))
    settingsSuccess.value = 'บันทึกเกณฑ์ตัดเกรดแล้ว'
  } catch (err) {
    settingsError.value = err.message || 'บันทึกเกณฑ์ตัดเกรดไม่สำเร็จ'
  } finally {
    cutoffsBusy.value = false
  }
}

const saveSettings = async () => {
  settingsBusy.value = true
  settingsError.value = ''
  settingsSuccess.value = ''

  try {
    const examId = await ensureDraftExam()
    await examService.updateExam(examId, buildExamPayload())
    metadata.lastSavedText = `บันทึกล่าสุด ${new Date().toLocaleTimeString('th-TH')}`
    settingsSuccess.value = 'บันทึกการตั้งค่าชุดข้อสอบแล้ว'
  } catch (err) {
    settingsError.value = err.message || 'บันทึกการตั้งค่าไม่สำเร็จ'
  } finally {
    settingsBusy.value = false
  }
}

const publishBusy = ref(false)

const handlePublish = async () => {
  if (publishBusy.value) return
  publishBusy.value = true
  builderFeedback.message = ''

  try {
    const examId = await ensureDraftExam()

    // 1. บันทึก metadata + คำถามที่ยังค้างอยู่ให้ครบก่อนเผยแพร่
    await examService.updateExam(examId, buildExamPayload())
    await flushUnpersistedQuestions(examId)

    // 2. รัน autoSave และรอให้เสร็จสิ้น — หากล้มเหลวจะโยน error เพื่อหยุดการเผยแพร่ทันที
    await runAutoSave()

    if (pendingQuestionPatches.size > 0) {
      throw new Error(`ยังมีคำถาม ${pendingQuestionPatches.size} ข้อที่กำลังบันทึกไม่สำเร็จ กรุณากดลองใหม่ก่อนเผยแพร่`)
    }

    const detail = await examService.getExamDetail(examId)
    if ((detail?.assignments?.length ?? 0) === 0) {
      assignments.value = []
      await openSettings()
      settingsError.value = 'ยังไม่ได้มอบหมายข้อสอบให้ห้องเรียนใดเลย — กรุณาเลือกห้องเรียนก่อนเผยแพร่'
      return
    }

    await examService.publishExam(examId)

    builderFeedback.message = `บันทึกและเผยแพร่ชุดข้อสอบ "${metadata.title}" เรียบร้อยแล้ว (จำนวน ${questions.value.length} ข้อ, ${currentTotalScore.value}/${metadata.targetScore} คะแนน)`
    builderFeedback.type = 'success'
    setTimeout(() => {
      router.push('/teacher/exams')
    }, 600)
  } catch (err) {
    console.error('รายละเอียดข้อผิดพลาดการเผยแพร่ชุดข้อสอบ (Console Only):', err.technical || err.message || err)
    builderFeedback.message = err?.message || 'เกิดข้อผิดพลาดในการเผยแพร่ชุดข้อสอบ กรุณาตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง'
    builderFeedback.type = 'error'
  } finally {
    publishBusy.value = false
  }
}

const handleEditRubric = () => {
  builderFeedback.message = 'ระบบแก้ไขเกณฑ์การให้คะแนนรูบริก (Rubric Editor) กำลังอยู่ระหว่างการพัฒนา'
  builderFeedback.type = 'info'
}

const handleImportFile = () => {
  resetImportState()
  showImportModal.value = true
}

const onImportFileChange = (event) => {
  const file = event.target.files?.[0] ?? null
  importError.value = ''
  importRowErrors.value = []
  importPreview.value = null
  importResult.value = null

  if (!file) {
    importFile.value = null
    importFileName.value = ''
    return
  }

  const dotIndex = file.name.lastIndexOf('.')
  const ext = dotIndex === -1 ? '' : file.name.slice(dotIndex).toLowerCase()
  if (!['.csv', '.xlsx'].includes(ext)) {
    importFile.value = null
    importFileName.value = ''
    importError.value = 'รองรับเฉพาะไฟล์ .csv และ .xlsx เท่านั้น'
    if (importInputRef.value) importInputRef.value.value = ''
    return
  }

  importFile.value = file
  importFileName.value = file.name
}

const resetImportState = () => {
  importFile.value = null
  importFileName.value = ''
  importError.value = ''
  importRowErrors.value = []
  importPreview.value = null
  importResult.value = null
  if (importInputRef.value) importInputRef.value.value = ''
}

const downloadImportTemplate = async () => {
  try {
    await examService.downloadQuestionTemplate()
  } catch (err) {
    importError.value = err?.message || 'ดาวน์โหลดแม่แบบไม่สำเร็จ'
  }
}

const handleImportFailure = (err) => {
  importError.value = err?.message || 'นำเข้าข้อสอบจากไฟล์ไม่สำเร็จ'
  importRowErrors.value = Array.isArray(err?.details) ? err.details : []
}

const previewImport = async () => {
  if (!importFile.value) {
    importError.value = 'กรุณาเลือกไฟล์ก่อนพรีวิว'
    return
  }
  importBusy.value = true
  importError.value = ''
  importRowErrors.value = []
  importPreview.value = null
  importResult.value = null
  try {
    const examId = await ensureDraftExam()
    importPreview.value = await examService.importQuestionsFromFile(examId, importFile.value, {
      dryRun: true
    })
  } catch (err) {
    handleImportFailure(err)
  } finally {
    importBusy.value = false
  }
}

const confirmImport = async () => {
  if (!importFile.value) {
    importError.value = 'กรุณาเลือกไฟล์ก่อนนำเข้า'
    return
  }
  importBusy.value = true
  importError.value = ''
  importRowErrors.value = []
  importPreview.value = null
  importResult.value = null
  try {
    const examId = await ensureDraftExam()
    const result = await examService.importQuestionsFromFile(examId, importFile.value, {
      dryRun: false
    })
    importResult.value = result
    await reloadQuestionsFromServer(examId)
    importFile.value = null
    importFileName.value = ''
    if (importInputRef.value) importInputRef.value.value = ''
  } catch (err) {
    handleImportFailure(err)
  } finally {
    importBusy.value = false
  }
}

const closeImportModal = () => {
  if (importBusy.value) return
  showImportModal.value = false
}

const handleImportBank = () => {
  builderFeedback.message = 'ระบบคลังข้อสอบกลาง (Question Bank) กำลังอยู่ระหว่างการพัฒนา'
  builderFeedback.type = 'info'
}
</script>

<style scoped src="@/assets/styles/views/teacher-exam-builder.css"></style>

