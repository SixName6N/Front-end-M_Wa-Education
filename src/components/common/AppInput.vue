<template>
  <div class="app-field" :class="{ 'app-field--error': !!error }">
    <!-- Header / Label row -->
    <div v-if="label || $slots['label-right']" class="app-field__header">
      <label v-if="label" :for="id" class="app-field__label">
        {{ label }}
      </label>
      <div v-if="$slots['label-right']" class="app-field__label-right">
        <slot name="label-right" />
      </div>
    </div>

    <!-- Input Control -->
    <div class="app-field__control" :class="{ 'app-field__control--focused': isFocused }">
      <span v-if="$slots.prefix" class="app-field__prefix">
        <slot name="prefix" />
      </span>

      <input
        :id="id"
        ref="inputRef"
        :type="computedType"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        :disabled="disabled"
        class="app-field__input"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Password Eye Toggle or custom suffix -->
      <button
        v-if="type === 'password'"
        type="button"
        class="app-field__suffix app-field__toggle-btn"
        tabindex="-1"
        :title="showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
        @click="showPassword = !showPassword"
      >
        <IconEyeOff v-if="showPassword" size="18" />
        <IconEye v-else size="18" />
      </button>
      <span v-else-if="$slots.suffix" class="app-field__suffix">
        <slot name="suffix" />
      </span>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="app-field__error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import IconEye from '@/components/icons/IconEye.vue'
import IconEyeOff from '@/components/icons/IconEyeOff.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])

const isFocused = ref(false)
const showPassword = ref(false)

const computedType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})
</script>

<style scoped src="@/assets/styles/components/input.css"></style>
