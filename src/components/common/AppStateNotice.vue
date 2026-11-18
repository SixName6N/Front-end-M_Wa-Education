<template>
  <div
    class="app-state-notice"
    :class="[`app-state-notice--${variant}`, { 'app-state-notice--compact': compact }]"
    :role="variant === 'error' ? 'alert' : 'status'"
  >
    <div class="app-state-notice__head">
      <span v-if="code" class="app-state-notice__code">{{ code }}</span>
      <h2 class="app-state-notice__title">{{ title }}</h2>
    </div>

    <p v-if="message" class="app-state-notice__message">{{ message }}</p>

    <div v-if="$slots.default || retryLabel" class="app-state-notice__actions">
      <button
        v-if="retryLabel"
        type="button"
        class="app-state-notice__btn"
        @click="$emit('retry')"
      >
        {{ retryLabel }}
      </button>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  /** รหัสสถานะที่แสดง เช่น 404, 500 หรือ "NETWORK" */
  code: {
    type: [String, Number],
    default: ''
  },
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'error', 'empty', 'success'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  retryLabel: {
    type: String,
    default: ''
  },
  compact: {
    type: Boolean,
    default: false
  }
})

defineEmits(['retry'])
</script>

<style scoped src="@/assets/styles/components/app-state-notice.css"></style>
