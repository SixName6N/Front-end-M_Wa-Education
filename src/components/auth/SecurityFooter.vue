<template>
  <div class="security-footer">
    <div class="security-footer__item">
      <IconShield size="15" />
      <span>Secure 256-bit TLS Exam Integrity</span>
    </div>
    <span class="security-footer__dot">•</span>
    <a href="/guide" class="security-footer__link" @click.prevent="$emit('guide')">
      <span>คู่มือการสอบ</span>
    </a>
  </div>
</template>

<script setup>
import IconShield from '@/components/icons/IconShield.vue'

defineEmits(['guide'])
</script>

<style scoped src="@/assets/styles/components/security-footer.css"></style>
