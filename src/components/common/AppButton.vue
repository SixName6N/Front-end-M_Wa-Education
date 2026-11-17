<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'app-btn',
      `app-btn--${variant}`,
      { 'app-btn--full': block, 'app-btn--loading': loading }
    ]"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="app-btn__spinner"></span>
    <span class="app-btn__content" :class="{ 'app-btn__content--hidden': loading }">
      <slot name="icon-left" />
      <slot />
      <slot name="icon-right" />
    </span>
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'outline', 'ghost', 'subtle'].includes(v)
  },
  block: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped src="@/assets/styles/components/button.css"></style>
