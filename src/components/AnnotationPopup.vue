<script setup lang="ts">
// =============================================================================
// AnnotationPopup.vue - Vue 3 version of AnnotationPopupCSS
// =============================================================================

import { ref, computed, onMounted, watch, nextTick, useCssModule } from 'vue'

// =============================================================================
// Types
// =============================================================================

// CSS Modules
const $style = useCssModule()

export interface AnnotationPopupProps {
  /** Element name to display in header */
  element: string
  /** Optional timestamp display (e.g., "@ 1.23s" for animation feedback) */
  timestamp?: string
  /** Optional selected/highlighted text */
  selectedText?: string
  /** Placeholder text for the textarea */
  placeholder?: string
  /** Initial value for textarea (for edit mode) */
  initialValue?: string
  /** Label for submit button (default: "Add") */
  submitLabel?: string
  /** Position styles (left, top) */
  popupStyle?: Record<string, string | number>
  /** Custom color for submit button and textarea focus (hex) */
  accentColor?: string
  /** External exit state (parent controls exit animation) */
  isExiting?: boolean
  /** Light mode styling */
  lightMode?: boolean
  /** Computed styles for the selected element */
  computedStyles?: Record<string, string>
}

export interface AnnotationPopupExpose {
  /** Shake the popup (e.g., when user clicks outside) */
  shake: () => void
}

// =============================================================================
// Props & Emits
// =============================================================================

const props = withDefaults(defineProps<AnnotationPopupProps>(), {
  placeholder: 'What should change?',
  initialValue: '',
  submitLabel: 'Add',
  accentColor: '#3c82f7',
  isExiting: false,
  lightMode: false,
})

const emit = defineEmits<{
  submit: [text: string]
  cancel: []
}>()

// =============================================================================
// State
// =============================================================================

const text = ref(props.initialValue)
const isShaking = ref(false)
const animState = ref<'initial' | 'enter' | 'entered' | 'exit'>('initial')
const isFocused = ref(false)
const isStylesExpanded = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const popupRef = ref<HTMLDivElement | null>(null)

// =============================================================================
// Computed
// =============================================================================

const hasComputedStyles = computed(() => {
  return props.computedStyles && Object.keys(props.computedStyles).length > 0
})

const popupClass = computed(() => {
  return [
    $style.popup,
    props.lightMode && $style.light,
    animState.value === 'enter' && $style.enter,
    animState.value === 'entered' && $style.entered,
    animState.value === 'exit' && $style.exit,
    isShaking.value && $style.shake,
  ].filter(Boolean)
})

// =============================================================================
// Methods
// =============================================================================

// Shake animation - exposed to parent via defineExpose
const shake = () => {
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
    textareaRef.value?.focus()
  }, 250)
}

// Handle cancel with exit animation
const handleCancel = () => {
  animState.value = 'exit'
  setTimeout(() => {
    emit('cancel')
  }, 150) // Match exit animation duration
}

// Handle submit
const handleSubmit = () => {
  if (!text.value.trim()) return
  emit('submit', text.value.trim())
}

// Handle keyboard
const handleKeyDown = (e: KeyboardEvent) => {
  // Skip if composing (IME input)
  if (e.isComposing || (e as any).nativeEvent?.isComposing) return

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
  if (e.key === 'Escape') {
    handleCancel()
  }
}

// Toggle computed styles accordion
const toggleStyles = () => {
  const wasExpanded = isStylesExpanded.value
  isStylesExpanded.value = !isStylesExpanded.value
  if (wasExpanded) {
    // Refocus textarea when closing
    nextTick(() => textareaRef.value?.focus())
  }
}

// Format CSS property name (camelCase to kebab-case)
const formatPropertyName = (key: string) => {
  return key.replace(/([A-Z])/g, '-$1').toLowerCase()
}

// =============================================================================
// Lifecycle
// =============================================================================

onMounted(() => {
  // Start enter animation
  requestAnimationFrame(() => {
    animState.value = 'enter'
  })

  // Transition to entered state after animation completes
  setTimeout(() => {
    animState.value = 'entered'
  }, 200) // Match animation duration

  // Auto-focus textarea
  setTimeout(() => {
    const textarea = textareaRef.value
    if (textarea) {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length
      textarea.scrollTop = textarea.scrollHeight
    }
  }, 50)
})

// Sync with parent exit state
watch(() => props.isExiting, (exiting) => {
  if (exiting && animState.value !== 'exit') {
    animState.value = 'exit'
  }
})

// =============================================================================
// Expose
// =============================================================================

defineExpose<AnnotationPopupExpose>({
  shake,
})
</script>

<template>
  <div
    ref="popupRef"
    :class="popupClass"
    data-annotation-popup
    :style="popupStyle"
    @click.stop
  >
    <!-- Header -->
    <div :class="$style.header">
      <button
        v-if="hasComputedStyles"
        :class="$style.headerToggle"
        type="button"
        @click="toggleStyles"
      >
        <svg
          :class="[$style.chevron, isStylesExpanded && $style.expanded]"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.5 10.25L9 7.25L5.75 4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span :class="$style.element">{{ element }}</span>
      </button>
      <span v-else :class="$style.element">{{ element }}</span>
      <span v-if="timestamp" :class="$style.timestamp">{{ timestamp }}</span>
    </div>

    <!-- Collapsible computed styles section -->
    <div
      v-if="hasComputedStyles"
      :class="[$style.stylesWrapper, isStylesExpanded && $style.expanded]"
    >
      <div :class="$style.stylesInner">
        <div :class="$style.stylesBlock">
          <div
            v-for="(value, key) in computedStyles"
            :key="key"
            :class="$style.styleLine"
          >
            <span :class="$style.styleProperty">{{ formatPropertyName(String(key)) }}</span>
            : <span :class="$style.styleValue">{{ value }}</span>;
          </div>
        </div>
      </div>
    </div>

    <!-- Selected text quote -->
    <div v-if="selectedText" :class="$style.quote">
      &ldquo;{{ selectedText.slice(0, 80) }}{{ selectedText.length > 80 ? '...' : '' }}&rdquo;
    </div>

    <!-- Textarea -->
    <textarea
      ref="textareaRef"
      :class="$style.textarea"
      :style="{ borderColor: isFocused ? accentColor : undefined }"
      :placeholder="placeholder"
      v-model="text"
      rows="2"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown="handleKeyDown"
    />

    <!-- Actions -->
    <div :class="$style.actions">
      <button :class="$style.cancel" @click="handleCancel">
        Cancel
      </button>
      <button
        :class="$style.submit"
        :style="{
          backgroundColor: accentColor,
          opacity: text.trim() ? 1 : 0.4,
        }"
        :disabled="!text.trim()"
        @click="handleSubmit"
      >
        {{ submitLabel }}
      </button>
    </div>
  </div>
</template>

<style module lang="scss">
// =============================================================================
// Animation Keyframes
// =============================================================================

@keyframes popupEnter {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.95) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(0);
  }
}

@keyframes popupExit {
  from {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) scale(0.95) translateY(4px);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(0);
  }
  20% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(-3px);
  }
  40% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(3px);
  }
  60% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(-2px);
  }
  80% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(2px);
  }
}

// =============================================================================
// Popup Container
// =============================================================================

.popup {
  position: fixed;
  transform: translateX(-50%);
  width: 280px;
  padding: 0.75rem 1rem 14px;
  background: #1a1a1a;
  border-radius: 16px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.08);
  cursor: default;
  z-index: 100001;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  will-change: transform, opacity;
  opacity: 0;

  &.enter {
    animation: popupEnter 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  &.entered {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(0);
  }

  &.exit {
    animation: popupExit 0.15s ease-in forwards;
  }

  &.entered.shake {
    animation: shake 0.25s ease-out;
  }
}

// =============================================================================
// Header
// =============================================================================

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5625rem;
}

.element {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.headerToggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex: 1;
  min-width: 0;
  text-align: left;

  .element {
    flex: 1;
  }
}

.chevron {
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;

  &.expanded {
    transform: rotate(90deg);
  }
}

// =============================================================================
// Computed Styles Block
// =============================================================================

.stylesWrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &.expanded {
    grid-template-rows: 1fr;
  }
}

.stylesInner {
  overflow: hidden;
}

.stylesBlock {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.375rem;
  padding: 0.5rem 0.625rem;
  margin-bottom: 0.5rem;
  font-family:
    ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.6875rem;
  line-height: 1.5;
}

.styleLine {
  color: rgba(255, 255, 255, 0.85);
  word-break: break-word;
}

.styleProperty {
  color: #c792ea;
}

.styleValue {
  color: rgba(255, 255, 255, 0.85);
}

.timestamp {
  font-size: 0.625rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.35);
  font-variant-numeric: tabular-nums;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

// =============================================================================
// Quote
// =============================================================================

.quote {
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
  padding: 0.4rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
  line-height: 1.45;
}

// =============================================================================
// Textarea
// =============================================================================

.textarea {
  width: 100%;
  padding: 0.5rem 0.625rem;
  font-size: 0.8125rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  resize: none;
  outline: none;
  transition: border-color 0.15s ease;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
}

// =============================================================================
// Actions
// =============================================================================

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.cancel,
.submit {
  padding: 0.4rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;
}

.cancel {
  background: transparent;
  color: rgba(255, 255, 255, 0.5);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }
}

.submit {
  color: white;

  &:hover:not(:disabled) {
    filter: brightness(0.9);
  }

  &:disabled {
    cursor: not-allowed;
  }
}

// =============================================================================
// Light Mode
// =============================================================================

.light {
  &.popup {
    background: #fff;
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(0, 0, 0, 0.06);
  }

  .element {
    color: rgba(0, 0, 0, 0.6);
  }

  .timestamp {
    color: rgba(0, 0, 0, 0.4);
  }

  .chevron {
    color: rgba(0, 0, 0, 0.4);
  }

  .stylesBlock {
    background: rgba(0, 0, 0, 0.03);
  }

  .styleLine {
    color: rgba(0, 0, 0, 0.75);
  }

  .styleProperty {
    color: #7c3aed;
  }

  .styleValue {
    color: rgba(0, 0, 0, 0.75);
  }

  .quote {
    color: rgba(0, 0, 0, 0.55);
    background: rgba(0, 0, 0, 0.04);
  }

  .textarea {
    background: rgba(0, 0, 0, 0.03);
    color: #1a1a1a;
    border-color: rgba(0, 0, 0, 0.12);

    &::placeholder {
      color: rgba(0, 0, 0, 0.4);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.15);
    }
  }

  .cancel {
    color: rgba(0, 0, 0, 0.5);

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: rgba(0, 0, 0, 0.75);
    }
  }
}
</style>
