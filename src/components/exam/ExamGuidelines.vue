<template>
  <div class="exam-guidelines">
    <div class="exam-guidelines__header">
      <IconShield size="18" />
      <span>ข้อแนะนำและระเบียบการสอบออนไลน์</span>
    </div>

    <div class="exam-guidelines__grid">
      <!-- 1 -->
      <div class="exam-guidelines__item">
        <span class="exam-guidelines__icon">📶</span>
        <div class="exam-guidelines__text">
          <strong>เครือข่ายอินเทอร์เน็ต:</strong> ควรตรวจสอบสัญญาณให้เสถียรก่อนกดเริ่มทำข้อสอบ
        </div>
      </div>

      <!-- 2 -->
      <div class="exam-guidelines__item">
        <span class="exam-guidelines__icon">💾</span>
        <div class="exam-guidelines__text">
          <strong>บันทึกคำตอบอัตโนมัติ:</strong> ทุกคำตอบจะบันทึกทันที หากไฟฟ้าดับสามารถเข้าทำต่อได้ตามเวลาที่เหลือ
        </div>
      </div>

      <!-- 3 -->
      <div class="exam-guidelines__item">
        <span class="exam-guidelines__icon">💻</span>
        <div class="exam-guidelines__text">
          <strong>ข้อปฏิบัติด้านความซื่อสัตย์:</strong> ห้ามสลับหน้าจอหรือเปิดแท็บใหม่ ระบบจะตรวจจับและบันทึกรายงานส่งครูผู้สอน
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconShield from '@/components/icons/IconShield.vue'
</script>

<style scoped src="@/assets/styles/components/exam-guidelines.css"></style>
