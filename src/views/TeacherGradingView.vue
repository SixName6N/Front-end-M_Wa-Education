<template>
  <TeacherLayout active-tab="grading">
    <div class="grading-view">
      <!-- Header Section & Quick Stats -->
      <section class="grading-header">
        <div>
          <nav aria-label="Breadcrumb" class="grading-breadcrumb">
            <span>หน้าหลัก</span>
            <span class="grading-breadcrumb__sep">/</span>
            <span class="grading-breadcrumb__current">ตรวจข้อสอบ</span>
          </nav>
          <h1 class="grading-title">ตรวจข้อสอบ</h1>
          <p class="grading-subtitle">เลือกชุดข้อสอบที่คุณต้องการตรวจหรือดูสรุปคะแนน</p>
        </div>

        <!-- Quick Stats Box -->
        <div class="grading-stats-card">
          <!-- Stat 1: Pending Review -->
          <div class="grading-stat-item">
            <div class="grading-stat-icon grading-stat-icon--amber">
              <span class="material-symbols-outlined text-[20px]">assignment_late</span>
            </div>
            <div class="grading-stat-info">
              <span class="grading-stat-label">ข้อสอบที่รอตรวจ</span>
              <span class="grading-stat-value grading-stat-value--amber">{{ pendingExams.length }} ชุด</span>
            </div>
          </div>

          <div class="grading-stat-divider"></div>

          <!-- Stat 2: Completed -->
          <div class="grading-stat-item">
            <div class="grading-stat-icon grading-stat-icon--emerald">
              <span class="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
            <div class="grading-stat-info">
              <span class="grading-stat-label">ตรวจเสร็จสมบูรณ์แล้ว</span>
              <span class="grading-stat-value grading-stat-value--emerald">{{ completedExams.length }} ชุด</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Action Tabs & Search Bar -->
      <div class="grading-filter-bar">
        <!-- Tabs -->
        <div class="grading-tabs-scroll">
          <button
            type="button"
            class="grading-tab-btn"
            :class="{ 'grading-tab-btn--active': activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            <span class="material-symbols-outlined text-[16px]">menu_book</span>
            <span>ทั้งหมด</span>
            <span class="grading-tab-badge">{{ pendingExams.length + completedExams.length }} ชุด</span>
          </button>

          <button
            type="button"
            class="grading-tab-btn"
            :class="{ 'grading-tab-btn--active': activeTab === 'pending' }"
            @click="activeTab = 'pending'"
          >
            <span class="material-symbols-outlined text-[16px]">assignment_late</span>
            <span>งานที่ต้องตรวจ</span>
            <span class="grading-tab-badge">{{ pendingExams.length }} ชุด</span>
          </button>

          <button
            type="button"
            class="grading-tab-btn"
            :class="{ 'grading-tab-btn--active': activeTab === 'completed' }"
            @click="activeTab = 'completed'"
          >
            <span class="material-symbols-outlined text-[16px]">task_alt</span>
            <span>ตรวจเสร็จแล้ว / ดูผลคะแนน</span>
            <span class="grading-tab-badge">{{ completedExams.length }} ชุด</span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="grading-search-wrap">
          <span class="material-symbols-outlined grading-search-icon text-[18px]">search</span>
          <input
            v-model="searchQuery"
            type="text"
            class="grading-search-input"
            placeholder="ค้นหาชื่อชุดข้อสอบหรือวิชา..."
          />
          <button
            v-if="searchQuery"
            type="button"
            class="grading-search-clear"
            @click="searchQuery = ''"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grading-empty-state">
        <span class="material-symbols-outlined grading-empty-icon animate-spin">sync</span>
        <h3 class="grading-empty-title">กำลังโหลดข้อมูลการตรวจข้อสอบ...</h3>
        <p class="grading-empty-desc">กำลังเชื่อมต่อฐานข้อมูลและประมวลผลรายการส่งข้อสอบ</p>
      </div>

      <!-- Error State -->
      <div v-else-if="fetchError" class="grading-empty-state">
        <span class="material-symbols-outlined grading-empty-icon" style="color: #ef4444;">error</span>
        <h3 class="grading-empty-title">เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
        <p class="grading-empty-desc">{{ fetchError }}</p>
        <button
          type="button"
          class="grading-empty-btn"
          @click="fetchGradingData"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>

      <!-- Content State -->
      <template v-else>
        <!-- Partial Load Warning Alert -->
        <div
          v-if="loadWarningMessage"
          class="grading-warning-banner p-4 mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center justify-between"
          role="alert"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-amber-600">warning</span>
            <span>{{ loadWarningMessage }}</span>
          </div>
          <button
            type="button"
            class="px-3 py-1 text-xs font-semibold bg-amber-600 text-white rounded hover:bg-amber-700 transition"
            @click="fetchGradingData"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>

        <!-- SECTION 1: Pending Grading (Action Required) -->
        <section
          v-if="shouldShowPendingSection"
          class="grading-section"
        >
          <div class="grading-section-header">
            <div class="grading-section-title-wrap">
              <span class="grading-dot grading-dot--amber"></span>
              <h2 class="grading-section-title">ชุดข้อสอบที่รออาจารย์ตรวจให้คะแนน</h2>
            </div>
            <span class="grading-section-hint">มีข้อสอบอัตนัยหรือคำตอบที่ต้องการคะแนนจากผู้สอน</span>
          </div>

          <!-- Pending Cards List -->
          <article
            v-for="exam in filteredPendingExams"
            :key="exam.id"
            class="grading-pending-card"
          >
            <div class="grading-pending-accent-bar"></div>

            <div class="grading-pending-body">
              <!-- Badges line -->
              <div class="grading-badges-row">
                <span class="grading-badge-course">
                  <span class="material-symbols-outlined text-[15px]">school</span>
                  <span>{{ exam.courseCode }} • {{ exam.category }}</span>
                </span>
                <span class="grading-badge-alert">
                  <span class="grading-pulse-dot"></span>
                  <span>มีคำตอบรอตรวจ ({{ exam.pendingCount }} คน)</span>
                </span>
              </div>

              <!-- Title & Meta -->
              <div>
                <h3 class="grading-card-title">{{ exam.title }}</h3>
                <p class="grading-card-meta">
                  <span v-if="exam.loadFailed" class="text-amber-700 font-medium">⚠️ ไม่สามารถโหลดข้อมูลการส่งได้</span>
                  <span v-else>นักเรียนส่งข้อสอบแล้ว {{ exam.submittedCount }} จาก {{ exam.totalStudents }} คน</span>
                  <span class="text-gray-300">•</span>
                  <span class="grading-meta-tag">{{ exam.loadFailed ? 'เกิดข้อผิดพลาด' : `รอตรวจ ${exam.pendingCount} คน` }}</span>
                </p>
              </div>

              <!-- Progress Indicator -->
              <div class="grading-progress-row">
                <div class="grading-progress-track">
                  <div
                    class="grading-progress-bar"
                    :style="{ width: `${exam.autoGradedPercent}%` }"
                  ></div>
                </div>
                <span class="grading-progress-label">
                  <span class="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>ตรวจเสร็จแล้ว {{ exam.autoGradedPercent }}%</span>
                </span>
              </div>
            </div>

            <!-- Start Grading CTA Button -->
            <div>
              <button
                v-if="exam.loadFailed"
                type="button"
                class="px-3 py-2 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center gap-1 shadow-sm"
                @click="fetchGradingData"
              >
                <span class="material-symbols-outlined text-[16px]">sync</span>
                <span>ลองโหลดใหม่</span>
              </button>
              <button
                v-else
                type="button"
                class="grading-cta-btn"
                @click="startGrading(exam)"
              >
                <span>เริ่มตรวจและให้คะแนนนักเรียน</span>
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </article>
        </section>

        <!-- SECTION 2: Completed / View Scores -->
        <section
          v-if="shouldShowCompletedSection"
          class="grading-section"
        >
          <div class="grading-section-header">
            <div class="grading-section-title-wrap">
              <span class="grading-dot grading-dot--emerald"></span>
              <h2 class="grading-section-title">ชุดข้อสอบที่ตรวจเสร็จแล้ว (ดูคะแนนได้ทันที)</h2>
            </div>
            <span class="grading-section-hint">คะแนนสรุปพร้อมให้นักเรียนและจัดทำรายงาน</span>
          </div>

          <!-- Completed Cards Stack -->
          <div class="grading-completed-list">
            <article
              v-for="exam in filteredCompletedExams"
              :key="exam.id"
              class="grading-completed-card"
            >
              <div class="grading-completed-body">
                <div class="grading-badges-row">
                  <span class="grading-badge-gray">{{ exam.courseCode }}</span>
                  <span class="grading-badge-green">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>ตรวจครบ 100%</span>
                  </span>
                  <span class="text-xs text-gray-500">{{ exam.classroomInfo }}</span>
                </div>

                <div>
                  <h3 class="grading-completed-title">{{ exam.title }}</h3>
                  <p class="grading-completed-desc">
                    {{ exam.summaryText }}
                  </p>
                </div>
              </div>

              <!-- View Score Button -->
              <div>
                <button
                  type="button"
                  class="grading-view-scores-btn"
                  @click="viewExamScores(exam)"
                >
                  <span class="material-symbols-outlined text-[16px]">visibility</span>
                  <span>ดูคะแนนนักเรียน</span>
                </button>
              </div>
            </article>
          </div>
        </section>

        <!-- Empty State if No Results Found -->
        <div v-if="noResultsFound" class="grading-empty-state">
          <div class="grading-empty-icon">
            <span class="material-symbols-outlined text-[24px]">search_off</span>
          </div>
          <h3 class="grading-empty-title">ไม่พบชุดข้อสอบตามเงื่อนไข</h3>
          <p class="grading-empty-desc">ยังไม่มีชุดข้อสอบที่มีนักเรียนส่งคำตอบ หรือลองเปลี่ยนคำค้นหา/ตัวกรอง</p>
          <button
            type="button"
            class="grading-empty-btn"
            @click="resetSearch"
          >
            ล้างคำค้นหา
          </button>
        </div>
      </template>

      <!-- Footer Help & Info Note -->
      <footer class="grading-helper-footer">
        <div class="grading-helper-left">
          <span class="material-symbols-outlined text-[16px] text-[#015b7e]">info</span>
          <span>ข้อสอบปรนัยจะตรวจให้อัตโนมัติ ส่วนข้อสอบอัตนัยคุณครูสามารถคลิกตรวจทีละคนได้อย่างสะดวก</span>
        </div>
        <div class="grading-helper-right">
          <a href="#" class="grading-helper-link" @click.prevent="showGuideModal = true">
            <span class="material-symbols-outlined text-[14px]">menu_book</span>
            <span>คู่มือการตรวจข้อสอบ</span>
          </a>
          <span>•</span>
          <a href="#" class="grading-helper-link" @click.prevent="showHelpModal = true">
            <span class="material-symbols-outlined text-[14px]">help</span>
            <span>สอบถามความช่วยเหลือ</span>
          </a>
        </div>
      </footer>

      <!-- Real Grading Workspace Modal -->
      <div
        v-if="activeGradingExam"
        class="grading-modal-overlay"
        @click.self="closeGradingModal"
      >
        <div class="grading-modal-card grading-modal-card--lg">
          <div class="grading-modal-header">
            <div>
              <span class="text-xs font-semibold text-[#015b7e]">{{ activeGradingExam.courseCode }}</span>
              <h4 class="grading-modal-title">ตรวจข้อสอบ: {{ activeGradingExam.title }}</h4>
            </div>
            <button
              type="button"
              class="grading-modal-close"
              @click="closeGradingModal"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="grading-modal-body">
            <!-- Submissions Loading -->
            <div v-if="loadingSubmissions" class="text-center py-8 text-gray-500">
              <span class="material-symbols-outlined text-[32px] animate-spin">sync</span>
              <p class="mt-2 text-sm">กำลังโหลดรายชื่อนักเรียนและคำตอบ...</p>
            </div>

            <!-- View 1: Student Answers Detail (Inspecting 1 student) -->
            <div v-else-if="selectedSubmissionDetail" class="flex flex-col gap-4">
              <div class="flex items-center justify-between pb-3 border-b">
                <button
                  type="button"
                  class="grading-btn-action-sm"
                  @click="selectedSubmissionDetail = null"
                >
                  <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>กลับไปหน้ารายชื่อ</span>
                </button>
                <div class="text-right">
                  <span class="font-bold text-gray-800">{{ selectedSubmissionDetail.student?.fullName }}</span>
                  <span class="text-xs text-gray-500 ml-2">({{ selectedSubmissionDetail.student?.studentCode || 'ไม่มีรหัส' }})</span>
                  <span class="ml-3 font-semibold text-[#015b7e]">
                    คะแนนรวม: {{ selectedSubmissionDetail.totalScore ?? 0 }} คะแนน
                  </span>
                </div>
              </div>

              <!-- List of Answers -->
              <div class="flex flex-col gap-4 max-h-[55vh] overflow-y-auto pr-1">
                <div
                  v-for="(ans, idx) in selectedSubmissionDetail.answers"
                  :key="ans.id"
                  class="grading-answer-box"
                >
                  <div class="flex items-center justify-between text-xs text-gray-600">
                    <span class="font-bold">ข้อที่ {{ idx + 1 }} • {{ ans.type === 'MULTIPLE_CHOICE' ? 'ปรนัย' : 'อัตนัย' }}</span>
                    <span>คะแนนเต็ม: {{ ans.points }} คะแนน</span>
                  </div>

                  <p class="text-sm font-medium text-gray-800">{{ ans.prompt }}</p>

                  <!-- Multiple Choice Display -->
                  <div v-if="ans.type === 'MULTIPLE_CHOICE'" class="text-xs space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold">สถานะ:</span>
                      <span v-if="ans.isCorrect" class="text-emerald-700 font-bold flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">check_circle</span> ถูกต้อง ({{ ans.awardedPoints }} คะแนน)
                      </span>
                      <span v-else class="text-rose-700 font-bold flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">cancel</span> ไม่ถูกต้อง (0 คะแนน)
                      </span>
                      <span class="text-gray-400 text-[11px]">(ตรวจอัตโนมัติ)</span>
                    </div>
                  </div>

                  <!-- Essay Answer Display & Grading -->
                  <div v-else class="flex flex-col gap-2">
                    <div class="text-xs font-semibold text-gray-700">คำตอบของนักเรียน:</div>
                    <div class="grading-answer-student-text">
                      {{ ans.textAnswer || '(นักเรียนไม่ได้ระบุคำตอบ)' }}
                    </div>

                    <div v-if="ans.referenceText" class="grading-answer-ref">
                      <strong>แนวคำตอบ/เกณฑ์:</strong> {{ ans.referenceText }}
                    </div>

                    <!-- Grading Controls -->
                    <div class="grading-grade-actions">
                      <button
                        type="button"
                        class="grading-btn-action-sm"
                        :class="{ 'grading-btn-action-sm--primary': ans.isCorrect === true }"
                        @click="setAnswerCorrectness(ans, true)"
                      >
                        <span class="material-symbols-outlined text-[14px]">check</span>
                        <span>ให้คะแนนเต็ม</span>
                      </button>

                      <button
                        type="button"
                        class="grading-btn-action-sm"
                        :class="{ 'grading-btn-action-sm--primary': ans.isCorrect === false }"
                        @click="setAnswerCorrectness(ans, false)"
                      >
                        <span class="material-symbols-outlined text-[14px]">close</span>
                        <span>ไม่ให้คะแนน</span>
                      </button>

                      <div class="flex items-center gap-1">
                        <span class="text-xs text-gray-600">คะแนน:</span>
                        <input
                          v-model.number="ans.awardedPoints"
                          type="number"
                          min="0"
                          :max="ans.points"
                          step="0.5"
                          class="grading-score-input"
                        />
                      </div>

                      <input
                        v-model="ans.graderComment"
                        type="text"
                        placeholder="หมายเหตุ/คำแนะนำแก่นักเรียน..."
                        class="grading-comment-input"
                      />

                      <button
                        type="button"
                        class="grading-save-btn"
                        :disabled="gradingActionLoading"
                        @click="saveAnswerGrade(ans)"
                      >
                        บันทึกข้อนี้
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Student Detail Footer Actions -->
              <div class="flex items-center justify-between pt-3 border-t">
                <span class="text-xs text-gray-500">
                  สถานะการส่ง: {{ selectedSubmissionDetail.status }}
                </span>
                <button
                  type="button"
                  class="grading-btn-action-sm grading-btn-action-sm--primary"
                  :disabled="gradingActionLoading"
                  @click="handleReleaseSubmission(selectedSubmissionDetail.id)"
                >
                  <span class="material-symbols-outlined text-[16px]">send</span>
                  <span>ส่งผลสอบให้นักเรียนคนนี้</span>
                </button>
              </div>
            </div>

            <!-- View 2: Submissions Table for this Exam -->
            <div v-else class="flex flex-col gap-4">
              <div v-if="gradingSubmissions.length === 0" class="text-center py-8 text-gray-500">
                <span class="material-symbols-outlined text-[36px] text-gray-400">person_off</span>
                <p class="mt-2 text-sm font-medium">ยังไม่มีนักเรียนส่งข้อสอบชุดนี้</p>
              </div>

              <div v-else class="grading-student-table-wrap">
                <table class="grading-student-table">
                  <thead>
                    <tr>
                      <th>นักเรียน</th>
                      <th>รหัสประจำตัว</th>
                      <th>เวลาที่ส่ง</th>
                      <th>สถานะ</th>
                      <th>คะแนน</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="sub in gradingSubmissions" :key="sub.id">
                      <td class="font-medium">{{ sub.student?.fullName || 'ไม่ระบุชื่อ' }}</td>
                      <td>{{ sub.student?.studentCode || '-' }}</td>
                      <td>{{ formatSubmissionDate(sub.submittedAt) }}</td>
                      <td>
                        <span
                          v-if="sub.needsGrading"
                          class="grading-badge-status grading-badge-status--amber"
                        >
                          รอตรวจอัตนัย ({{ sub.ungradedCount }} ข้อ)
                        </span>
                        <span
                          v-else-if="sub.status === 'RELEASED'"
                          class="grading-badge-status grading-badge-status--blue"
                        >
                          ปล่อยผลแล้ว
                        </span>
                        <span
                          v-else-if="sub.status === 'GRADED'"
                          class="grading-badge-status grading-badge-status--green"
                        >
                          ตรวจครบแล้ว
                        </span>
                        <span
                          v-else
                          class="grading-badge-status grading-badge-status--gray"
                        >
                          {{ sub.status }}
                        </span>
                      </td>
                      <td class="font-bold">{{ sub.totalScore ?? '-' }}</td>
                      <td>
                        <button
                          type="button"
                          class="grading-btn-action-sm grading-btn-action-sm--primary"
                          @click="openStudentSubmission(sub)"
                        >
                          <span class="material-symbols-outlined text-[14px]">edit_note</span>
                          <span>ตรวจคำตอบ</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="grading-modal-footer">
            <button
              v-if="gradingSubmissions.length > 0 && !selectedSubmissionDetail"
              type="button"
              class="grading-btn-action-sm grading-btn-action-sm--primary"
              :disabled="gradingActionLoading"
              @click="handleReleaseAllResults(activeGradingExam.id)"
            >
              <span class="material-symbols-outlined text-[16px]">campaign</span>
              <span>ปล่อยผลสอบทั้งชุดให้นักเรียนทุกคน</span>
            </button>
            <button
              type="button"
              class="grading-view-scores-btn"
              @click="closeGradingModal"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>

      <!-- Score Summary Modal (Real API Data) -->
      <div
        v-if="selectedExamForScores"
        class="grading-modal-overlay"
        @click.self="selectedExamForScores = null"
      >
        <div class="grading-modal-card">
          <div class="grading-modal-header">
            <div>
              <span class="text-xs font-semibold text-[#015b7e]">{{ selectedExamForScores.courseCode }}</span>
              <h4 class="grading-modal-title">{{ selectedExamForScores.title }}</h4>
            </div>
            <button
              type="button"
              class="grading-modal-close"
              @click="selectedExamForScores = null"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="grading-modal-body">
            <div class="grading-modal-stat-grid">
              <div class="grading-modal-stat-box">
                <span class="grading-modal-stat-label">จำนวนผู้ส่งข้อสอบ</span>
                <div class="grading-modal-stat-val">{{ selectedExamForScores.totalStudents }} คน</div>
              </div>
              <div class="grading-modal-stat-box">
                <span class="grading-modal-stat-label">คะแนนเฉลี่ย</span>
                <div class="grading-modal-stat-val text-emerald-600">{{ selectedExamForScores.avgScore }} คะแนน</div>
              </div>
            </div>
            <p class="text-sm text-gray-600">
              สถานะ: ตรวจคำตอบครบถ้วนเรียบร้อยแล้ว ข้อมูลคะแนนถูกคำนวณและบันทึกจากระบบวัดผลจริง
            </p>
          </div>

          <div class="grading-modal-footer">
            <button
              type="button"
              class="grading-view-scores-btn"
              @click="selectedExamForScores = null"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>

      <!-- Guide Modal -->
      <div
        v-if="showGuideModal"
        class="grading-modal-overlay"
        @click.self="showGuideModal = false"
      >
        <div class="grading-modal-card">
          <div class="grading-modal-header">
            <h4 class="grading-modal-title">คู่มือการตรวจข้อสอบและประเมินผล</h4>
            <button
              type="button"
              class="grading-modal-close"
              @click="showGuideModal = false"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div class="grading-modal-body text-sm text-gray-700 space-y-2">
            <p><strong>1. ข้อสอบปรนัย (Multiple Choice):</strong> ระบบจะตรวจคำตอบและคิดคะแนนให้อัตโนมัติทันทีที่นักเรียนส่งข้อสอบ</p>
            <p><strong>2. ข้อสอบอัตนัย (Essay):</strong> คุณครูสามารถคลิก "เริ่มตรวจและให้คะแนนนักเรียน" เพื่ออ่านคำตอบ ตรวจเทียบกับเกณฑ์แนวคำตอบ และใส่คะแนนพร้อมคำแนะนำ</p>
            <p><strong>3. การส่งผลสอบ:</strong> เมื่อตรวจเสร็จ สามารถกด "ส่งผลตรวจให้นักเรียน" หรือ "ปล่อยผลสอบทั้งชุด" เพื่อให้นักเรียนดูผลคะแนนได้ทันที</p>
          </div>
          <div class="grading-modal-footer">
            <button
              type="button"
              class="grading-view-scores-btn"
              @click="showGuideModal = false"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      </div>

      <!-- Help Modal -->
      <div
        v-if="showHelpModal"
        class="grading-modal-overlay"
        @click.self="showHelpModal = false"
      >
        <div class="grading-modal-card">
          <div class="grading-modal-header">
            <h4 class="grading-modal-title">ศูนย์ความช่วยเหลือด้านการวัดผล</h4>
            <button
              type="button"
              class="grading-modal-close"
              @click="showHelpModal = false"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div class="grading-modal-body text-sm text-gray-700 space-y-2">
            <p>หากพบปัญหาในการตรวจข้อสอบหรือการคำนวณคะแนน กรุณาติดต่อฝ่ายสนับสนุนการใช้งาน:</p>
            <ul class="list-disc pl-5 space-y-1">
              <li><strong>อีเมล:</strong> support@examhub.local</li>
              <li><strong>โทรศัพท์:</strong> 02-xxx-xxxx ต่อ 104 (ฝ่ายทะเบียนและวัดผล)</li>
            </ul>
          </div>
          <div class="grading-modal-footer">
            <button
              type="button"
              class="grading-view-scores-btn"
              @click="showHelpModal = false"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  </TeacherLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TeacherLayout from '@/layouts/TeacherLayout.vue'
import { examService } from '@/services/examService'
import { gradingService } from '@/services/gradingService'

// Filter states
const activeTab = ref('all') // 'all' | 'pending' | 'completed'
const searchQuery = ref('')

// Pure API Data States (Zero hardcoded mock)
const pendingExams = ref([])
const completedExams = ref([])
const loading = ref(false)
const fetchError = ref('')
const loadWarningMessage = ref('')

// Real Grading Flow States
const activeGradingExam = ref(null)
const gradingSubmissions = ref([])
const loadingSubmissions = ref(false)
const selectedSubmissionDetail = ref(null)
const gradingActionLoading = ref(false)

// Modals
const selectedExamForScores = ref(null)
const showGuideModal = ref(false)
const showHelpModal = ref(false)

/**
 * Fetch real exam & grading data from API
 */
async function fetchGradingData() {
  loading.value = true
  fetchError.value = ''
  loadWarningMessage.value = ''
  pendingExams.value = []
  completedExams.value = []

  try {
    const examsList = await examService.listExams()
    if (!examsList || examsList.length === 0) {
      return
    }

    // โหลด submissions ของแต่ละข้อสอบ และดึงรายละเอียดเฉพาะชุดที่มีการมอบหมายห้องเรียน
    const gradingPromises = examsList.map(async (exam) => {
      try {
        const hasAssignments = (exam._count?.assignments ?? 0) > 0
        const [submissions, detail] = await Promise.all([
          gradingService.listExamSubmissions(exam.id),
          hasAssignments ? examService.getExamDetail(exam.id).catch(() => null) : Promise.resolve(null)
        ])
        return { exam, submissions, detail, loadFailed: false }
      } catch (err) {
        console.error(`โหลดข้อมูลการส่งของชุดข้อสอบ "${exam.title}" (ID: ${exam.id}) ล้มเหลว:`, err)
        return {
          exam,
          submissions: [],
          detail: null,
          loadFailed: true,
          errorMessage: err.message || 'โหลดข้อมูลล้มเหลว'
        }
      }
    })

    const results = await Promise.all(gradingPromises)

    // ตรวจสอบว่ามีชุดที่โหลดไม่สำเร็จหรือไม่ เพื่อแจ้งเตือนบนหน้าเว็บ
    const failedExams = results.filter((r) => r.loadFailed)
    if (failedExams.length > 0) {
      const names = failedExams.map((f) => `"${f.exam.title}"`).join(', ')
      loadWarningMessage.value = `โหลดข้อมูลการส่งของชุดข้อสอบไม่สำเร็จ: ${names} (กรุณาลองใหม่อีกครั้ง)`
    }

    const pending = []
    const completed = []

    for (const { exam, submissions, detail, loadFailed, errorMessage } of results) {
      const courseCode = exam.course?.code || exam.courseCode || ''
      const title = exam.title
      const category = exam.course?.title || exam.course?.code || ''
      const submittedCount = submissions.length

      // คำนวณจำนวนนักเรียนจริงจากห้องเรียนที่มอบหมาย หากไม่มีห้องเรียนที่มอบหมายให้ใช้ยอดส่งจริง
      let totalAssignedStudents = 0
      if (detail?.assignments && Array.isArray(detail.assignments)) {
        totalAssignedStudents = detail.assignments.reduce((sum, a) => {
          return sum + (Number(a.classroom?._count?.enrollments) || 0)
        }, 0)
      }
      const totalStudents = totalAssignedStudents > 0
        ? Math.max(totalAssignedStudents, submittedCount)
        : submittedCount

      const pendingSubmissions = submissions.filter((s) => s.needsGrading || s.status === 'SUBMITTED')
      const completedSubmissions = submissions.filter((s) => s.status === 'GRADED' || s.status === 'RELEASED')

      if (loadFailed) {
        // หากโหลดไม่สำเร็จ ให้แสดงการ์ดพร้อมสถานะแจ้งเตือนข้อผิดพลาดชัดเจน (ไม่หลอกตาว่าส่งแล้ว 0 คน)
        pending.push({
          id: exam.id,
          courseCode,
          category,
          title,
          submittedCount: 0,
          totalStudents: 0,
          pendingCount: 0,
          autoGradedPercent: 0,
          hasEssay: false,
          submissions: [],
          loadFailed: true,
          errorMessage
        })
      } else if (pendingSubmissions.length > 0 || (exam.status === 'CLOSED' && submittedCount > 0 && pendingSubmissions.length > 0)) {
        pending.push({
          id: exam.id,
          courseCode,
          category,
          title,
          submittedCount,
          totalStudents: Math.max(totalStudents, submittedCount),
          pendingCount: pendingSubmissions.length,
          autoGradedPercent: submittedCount > 0 ? Math.round(((submittedCount - pendingSubmissions.length) / submittedCount) * 100) : 100,
          hasEssay: true,
          submissions,
          loadFailed: false
        })
      } else if (completedSubmissions.length > 0) {
        const totalScoreSum = completedSubmissions.reduce((sum, s) => sum + (Number(s.totalScore) || 0), 0)
        const avgScore = completedSubmissions.length > 0 ? (totalScoreSum / completedSubmissions.length).toFixed(1) : '0'

        completed.push({
          id: exam.id,
          courseCode,
          category,
          title,
          classroomInfo: `ส่งแล้ว ${submittedCount} คน`,
          totalStudents: submittedCount,
          avgScore: `${avgScore}`,
          summaryText: `ตรวจคำตอบครบถ้วน ${completedSubmissions.length} คน • คะแนนเฉลี่ย ${avgScore} คะแนน`,
          submissions,
          loadFailed: false
        })
      }
    }

    pendingExams.value = pending
    completedExams.value = completed
  } catch (err) {
    fetchError.value = err.message || 'ไม่สามารถโหลดข้อมูลชุดข้อสอบสำหรับตรวจได้'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchGradingData()
})

// Filtered lists
const filteredPendingExams = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return pendingExams.value.filter((e) => {
    if (!q) return true
    return e.title.toLowerCase().includes(q) || e.courseCode.toLowerCase().includes(q)
  })
})

const filteredCompletedExams = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return completedExams.value.filter((e) => {
    if (!q) return true
    return e.title.toLowerCase().includes(q) || e.courseCode.toLowerCase().includes(q)
  })
})

const shouldShowPendingSection = computed(() => {
  if (activeTab.value === 'completed') return false
  return filteredPendingExams.value.length > 0
})

const shouldShowCompletedSection = computed(() => {
  if (activeTab.value === 'pending') return false
  return filteredCompletedExams.value.length > 0
})

const noResultsFound = computed(() => {
  return !shouldShowPendingSection.value && !shouldShowCompletedSection.value
})

const resetSearch = () => {
  searchQuery.value = ''
  activeTab.value = 'all'
}

/**
 * Real Grading Flow: Open exam submissions workspace
 */
async function startGrading(exam) {
  activeGradingExam.value = exam
  selectedSubmissionDetail.value = null
  loadingSubmissions.value = true

  try {
    const list = await gradingService.listExamSubmissions(exam.id)
    gradingSubmissions.value = list
  } catch (err) {
    alert(err.message || 'ไม่สามารถโหลดรายการส่งข้อสอบได้')
    gradingSubmissions.value = []
  } finally {
    loadingSubmissions.value = false
  }
}

function closeGradingModal() {
  activeGradingExam.value = null
  selectedSubmissionDetail.value = null
  gradingSubmissions.value = []
}

/**
 * Open single student submission to inspect answers and grade
 */
async function openStudentSubmission(submission) {
  loadingSubmissions.value = true
  try {
    const detail = await gradingService.getSubmissionDetail(submission.id)
    selectedSubmissionDetail.value = detail
  } catch (err) {
    alert(err.message || 'ไม่สามารถโหลดคำตอบของนักเรียนได้')
  } finally {
    loadingSubmissions.value = false
  }
}

function setAnswerCorrectness(answer, isCorrect) {
  answer.isCorrect = isCorrect
  answer.awardedPoints = isCorrect ? answer.points : 0
}

/**
 * Grade single essay answer via API
 */
async function saveAnswerGrade(answer) {
  if (!selectedSubmissionDetail.value) return
  gradingActionLoading.value = true

  try {
    const updated = await gradingService.gradeAnswer(answer.id, {
      isCorrect: answer.isCorrect,
      awardedPoints: Number(answer.awardedPoints) || 0,
      graderComment: answer.graderComment || null
    })

    if (updated?.totalScore !== undefined) {
      selectedSubmissionDetail.value.totalScore = updated.totalScore
    }

    // Refresh submission list in background
    if (activeGradingExam.value) {
      gradingSubmissions.value = await gradingService.listExamSubmissions(activeGradingExam.value.id)
    }
  } catch (err) {
    alert(err.message || 'บันทึกคะแนนข้อนี้ไม่สำเร็จ')
  } finally {
    gradingActionLoading.value = false
  }
}

/**
 * Release result to a single student via API
 */
async function handleReleaseSubmission(submissionId) {
  gradingActionLoading.value = true
  try {
    await gradingService.releaseSubmission(submissionId)
    // Reload details and list
    if (activeGradingExam.value) {
      gradingSubmissions.value = await gradingService.listExamSubmissions(activeGradingExam.value.id)
    }
    selectedSubmissionDetail.value = null
    await fetchGradingData()
  } catch (err) {
    alert(err.message || 'ส่งผลสอบให้นักเรียนไม่สำเร็จ')
  } finally {
    gradingActionLoading.value = false
  }
}

/**
 * Release all exam results to students via API
 */
async function handleReleaseAllResults(examId) {
  if (!confirm('ยืนยันการปล่อยผลสอบทั้งชุดให้นักเรียนทุกคนที่ตรวจเสร็จแล้ว?')) return
  gradingActionLoading.value = true
  try {
    await gradingService.releaseExamResults(examId)
    gradingSubmissions.value = await gradingService.listExamSubmissions(examId)
    await fetchGradingData()
  } catch (err) {
    alert(err.message || 'ปล่อยผลสอบทั้งชุดไม่สำเร็จ')
  } finally {
    gradingActionLoading.value = false
  }
}

function viewExamScores(exam) {
  selectedExamForScores.value = exam
}

function formatSubmissionDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped src="@/assets/styles/views/teacher-grading.css"></style>
