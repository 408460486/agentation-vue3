<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const OUTPUT_DETAIL_OPTIONS = ['Compact', 'Standard', 'Detailed', 'Forensic']
const COLOR_OPTIONS = [
  { value: '#AF52DE', label: 'Purple' },
  { value: '#3c82f7', label: 'Blue' },
  { value: '#5AC8FA', label: 'Cyan' },
  { value: '#34C759', label: 'Green' },
  { value: '#FFD60A', label: 'Yellow' },
  { value: '#FF9500', label: 'Orange' },
  { value: '#FF3B30', label: 'Red' },
]

const showPanel = ref(true)
const isDarkMode = ref(true)
const outputDetail = ref(1)
const selectedColor = ref(1)
const clearAfterCopy = ref(false)
const blockInteractions = ref(false)
const cursorPos = ref({ x: 190, y: 20 })
const isClicking = ref(false)
const activeCaption = ref<string | null>('output')

const containerRef = ref<HTMLDivElement | null>(null)
const cycleBtnRef = ref<HTMLButtonElement | null>(null)
const greenColorRef = ref<HTMLDivElement | null>(null)
const clearCheckboxRef = ref<HTMLSpanElement | null>(null)
const blockCheckboxRef = ref<HTMLSpanElement | null>(null)
const themeToggleRef = ref<HTMLButtonElement | null>(null)

const positionsRef = ref({
  cycleBtn: { x: 178, y: 82 },
  greenColor: { x: 106, y: 142 },
  clearCheckbox: { x: 24, y: 188 },
  blockCheckbox: { x: 24, y: 210 },
  themeToggle: { x: 194, y: 42 },
})

const currentColor = computed(() => COLOR_OPTIONS[selectedColor.value].value)

const captionKeys: Record<string, string> = {
  output: 'settingsDemo.output',
  color: 'settingsDemo.color',
  clear: 'settingsDemo.clear',
  block: 'settingsDemo.block',
  theme: 'settingsDemo.theme',
}

const measurePositions = () => {
  if (!containerRef.value) return
  const containerRect = containerRef.value.getBoundingClientRect()

  const getCenter = (el: HTMLElement | null) => {
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2,
    }
  }

  const cyclePos = getCenter(cycleBtnRef.value)
  const greenPos = getCenter(greenColorRef.value)
  const clearPos = getCenter(clearCheckboxRef.value)
  const blockPos = getCenter(blockCheckboxRef.value)
  const themePos = getCenter(themeToggleRef.value)

  if (cyclePos) positionsRef.value.cycleBtn = cyclePos
  if (greenPos) positionsRef.value.greenColor = greenPos
  if (clearPos) positionsRef.value.clearCheckbox = clearPos
  if (blockPos) positionsRef.value.blockCheckbox = blockPos
  if (themePos) positionsRef.value.themeToggle = themePos
}

let cancelled = false
let interval: ReturnType<typeof setInterval> | null = null

const click = async () => {
  isClicking.value = true
  await delay(100)
  if (!cancelled) isClicking.value = false
}

const runAnimation = async () => {
  showPanel.value = true
  isDarkMode.value = true
  outputDetail.value = 1
  selectedColor.value = 1
  clearAfterCopy.value = false
  blockInteractions.value = false
  activeCaption.value = 'output'

  await delay(100)
  measurePositions()
  const pos = positionsRef.value
  cursorPos.value = pos.cycleBtn
  await delay(1400)
  if (cancelled) return

  await click()
  outputDetail.value = 2
  await delay(2800)
  if (cancelled) return

  activeCaption.value = 'color'
  cursorPos.value = pos.greenColor
  await delay(1000)
  if (cancelled) return
  await click()
  selectedColor.value = 3
  await delay(2800)
  if (cancelled) return

  activeCaption.value = 'clear'
  cursorPos.value = pos.clearCheckbox
  await delay(1000)
  if (cancelled) return
  await click()
  clearAfterCopy.value = true
  await delay(2800)
  if (cancelled) return

  activeCaption.value = 'block'
  cursorPos.value = pos.blockCheckbox
  await delay(1000)
  if (cancelled) return
  await click()
  blockInteractions.value = true
  await delay(2800)
  if (cancelled) return

  activeCaption.value = 'theme'
  cursorPos.value = pos.themeToggle
  await delay(1000)
  if (cancelled) return
  await click()
  isDarkMode.value = false
  await delay(3000)
  if (cancelled) return

  await delay(1500)
}

const handleVisibility = () => {
  if (document.visibilityState === 'visible') {
    cancelled = true
    if (interval) clearInterval(interval)
    setTimeout(() => {
      cancelled = false
      runAnimation()
      interval = setInterval(runAnimation, 26000)
    }, 100)
  }
}

onMounted(() => {
  setTimeout(measurePositions, 100)
  window.addEventListener('resize', measurePositions)
  document.addEventListener('visibilitychange', handleVisibility)

  runAnimation()
  interval = setInterval(runAnimation, 26000)
})

onUnmounted(() => {
  cancelled = true
  if (interval) clearInterval(interval)
  window.removeEventListener('resize', measurePositions)
  document.removeEventListener('visibilitychange', handleVisibility)
})
</script>

<template>
  <div class="sd-outer">
    <div class="sd-container" ref="containerRef">
      <div
        :class="['sd-panel', { visible: showPanel }, isDarkMode ? 'dark' : 'light']"
        @click.capture.stop
      >
        <!-- Header -->
        <div class="sd-header">
          <span class="sd-brand">
            <span class="sd-brand-slash" :style="{ color: currentColor }">/</span>
            agentation
          </span>
          <span class="sd-version">v0.3.2</span>
          <button ref="themeToggleRef" class="sd-theme-toggle">
            <svg v-if="isDarkMode" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M12 2V4M12 20V22M4 12H2M22 12H20M5.64 5.64L4.22 4.22M19.78 19.78L18.36 18.36M5.64 18.36L4.22 19.78M19.78 4.22L18.36 5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Output Detail -->
        <div class="sd-section">
          <div class="sd-row">
            <span class="sd-label">Output Detail</span>
            <button ref="cycleBtnRef" class="sd-cycle-btn">
              <span class="sd-cycle-text" :key="outputDetail">{{ OUTPUT_DETAIL_OPTIONS[outputDetail] }}</span>
              <span class="sd-cycle-dots">
                <span
                  v-for="(_, i) in OUTPUT_DETAIL_OPTIONS"
                  :key="i"
                  :class="['sd-cycle-dot', { active: outputDetail === i }]"
                />
              </span>
            </button>
          </div>
        </div>

        <!-- Marker Colour -->
        <div class="sd-section">
          <span class="sd-label sd-label-marker">Marker Colour</span>
          <div class="sd-colors">
            <div
              v-for="(color, i) in COLOR_OPTIONS"
              :key="color.value"
              :ref="el => { if (i === 3) greenColorRef = el as HTMLDivElement }"
              :class="['sd-color-ring', { selected: selectedColor === i }]"
              :style="{ borderColor: selectedColor === i ? color.value : 'transparent' }"
            >
              <div
                :class="['sd-color', { selected: selectedColor === i }]"
                :style="{ backgroundColor: color.value }"
              />
            </div>
          </div>
        </div>

        <!-- Checkboxes -->
        <div class="sd-section">
          <label class="sd-checkbox-row">
            <span ref="clearCheckboxRef" :class="['sd-checkbox', { checked: clearAfterCopy }]">
              <svg v-if="clearAfterCopy" width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="sd-checkbox-label">Clear after output</span>
          </label>
          <label class="sd-checkbox-row">
            <span ref="blockCheckboxRef" :class="['sd-checkbox', { checked: blockInteractions }]">
              <svg v-if="blockInteractions" width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="sd-checkbox-label">Block page interactions</span>
          </label>
        </div>
      </div>

      <!-- Cursor -->
      <div :class="['sd-cursor', { clicking: isClicking }]" :style="{ left: cursorPos.x + 'px', top: cursorPos.y + 'px' }">
        <svg height="24" width="24" viewBox="0 0 32 32">
          <g fill="none" fill-rule="evenodd" transform="translate(10 7)">
            <path d="m6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.316-3.221z" fill="#fff"/>
            <path d="m6.431 17 1.765-.941-2.775-5.202h3.604l-8.025-8.043v11.188l2.53-2.442z" fill="#000"/>
          </g>
        </svg>
      </div>
    </div>

    <!-- Caption -->
    <p :key="activeCaption" style="margin-top: 1rem; font-size: 0.75rem; color: rgba(255,255,255,0.5); white-space: pre-line; line-height: 1.3; animation: fadeIn 0.3s ease">
      {{ t(activeCaption ? captionKeys[activeCaption] : captionKeys.output) }}
    </p>
  </div>
</template>
