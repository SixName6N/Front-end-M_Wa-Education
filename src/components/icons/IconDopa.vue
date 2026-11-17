<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="2" y1="21" x2="22" y2="21" />
    <line x1="4" y1="18" x2="20" y2="18" />
    <path d="M12 2L2 7h20L12 2z" />
    <line x1="6" y1="10" x2="6" y2="15" />
    <line x1="10" y1="10" x2="10" y2="15" />
    <line x1="14" y1="10" x2="14" y2="15" />
    <line x1="18" y1="10" x2="18" y2="15" />
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 18
  }
})
</script>
