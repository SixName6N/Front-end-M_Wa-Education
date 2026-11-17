<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M2 3h20v14H2z" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 8h10" />
    <path d="M7 12h6" />
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
