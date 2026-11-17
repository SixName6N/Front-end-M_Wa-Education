<template>
  <label class="app-checkbox" :class="{ 'app-checkbox--disabled': disabled }">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="app-checkbox__input"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="app-checkbox__box">
      <svg
        v-if="modelValue"
        class="app-checkbox__icon"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13.5 4.5L6.5 11.5L3 8"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="app-checkbox__label">
      <slot />
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped src="@/assets/styles/components/checkbox.css"></style>
