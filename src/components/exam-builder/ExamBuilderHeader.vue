<template>
  <header class="eb-header">
    <div class="eb-header__inner">
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="eb-breadcrumb">
        <router-link to="/teacher/exams/create">คลังข้อสอบ</router-link>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <span>วิชาวิทยาศาสตร์และเทคโนโลยี ม.3</span>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <span class="eb-breadcrumb__active">สร้างชุดข้อสอบใหม่</span>
      </nav>

      <!-- Exam Title & Header Actions -->
      <div class="eb-header__main">
        <div class="eb-header__title-group">
          <div class="eb-header__title-row">
            <input
              type="text"
              class="eb-header__title-input"
              v-model="modelValue.title"
              placeholder="ระบุชื่อชุดข้อสอบ..."
              title="คลิกเพื่อแก้ไขชื่อชุดข้อสอบ"
            />
            <span class="material-symbols-outlined text-outline text-[18px]">edit</span>
          </div>

          <!-- Metadata Tags -->
          <div class="eb-header__meta-row">
            <span class="eb-meta-badge">
              <span class="material-symbols-outlined text-[14px] text-primary">tag</span>
              รหัสวิชา {{ modelValue.subjectCode }}
            </span>
            <span class="eb-meta-bullet">•</span>
            <span>{{ modelValue.semester }}</span>
            <span class="eb-meta-bullet">•</span>
            <span class="eb-meta-badge--primary">เป้าหมาย {{ modelValue.targetScore }} คะแนน</span>
            <span class="eb-meta-bullet">•</span>
            <span>เวลาสอบ {{ modelValue.durationMinutes }} นาที</span>
            <span class="eb-meta-bullet">•</span>
            <span class="eb-meta-badge eb-meta-badge--saved">
              <span class="material-symbols-outlined text-[14px]">cloud_done</span>
              {{ modelValue.lastSavedText }}
            </span>
          </div>
        </div>

        <!-- Action CTA Buttons -->
        <div class="eb-header__actions">
          <button
            type="button"
            class="eb-btn eb-btn--secondary"
            @click="$emit('preview')"
          >
            <span class="material-symbols-outlined text-[18px]">visibility</span>
            <span>แสดงตัวอย่าง (Preview)</span>
          </button>
          <button
            type="button"
            class="eb-btn eb-btn--primary"
            @click="$emit('publish')"
          >
            <span class="material-symbols-outlined text-[18px]">publish</span>
            <span>บันทึกและเผยแพร่</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

defineEmits(['update:modelValue', 'preview', 'publish'])
</script>
