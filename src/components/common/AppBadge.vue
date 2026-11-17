<template>
  <span class="app-badge">
    <span v-if="dot" class="app-badge__dot"></span>
    <slot />
  </span>
</template>

<script setup>
defineProps({
  dot: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped src="@/assets/styles/components/badge.css"></style>
