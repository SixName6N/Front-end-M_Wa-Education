<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="icon-svg"
  >
    <path
      d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z"
      fill="currentColor"
    />
    <path
      d="M5 13.18V17.18C5 19.5 8.13 21.5 12 21.5C15.87 21.5 19 19.5 19 17.18V13.18L12 17L5 13.18Z"
      fill="currentColor"
    />
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 24
  }
})
</script>
