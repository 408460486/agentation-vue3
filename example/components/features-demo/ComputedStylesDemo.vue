<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import ToolbarIcon from './ToolbarIcon.vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const cursorPos = ref({ x: 300, y: 80 })
const showHighlight = ref(false)
const showPopup = ref(false)
const showMarker = ref(false)
const typedText = ref('')
const isCrosshair = ref(true)
const isStylesExpanded = ref(false)
const btnPos = ref({ x: 20, y: 100, width: 100, height: 36 })

const btnRef = ref<HTMLDivElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)
const chevronRef = ref<HTMLButtonElement | null>(null)
const btnPosRef = ref({ x: 20, y: 100, width: 100, height: 36 })
const chevronPosRef = ref({ x: 0, y: 0 })

const feedbackText = 'Make avatar 48px'

const computedStyles = [
  { prop: 'width', value: '44px' },
  { prop: 'height', value: '44px' },
  { prop: 'border-radius', value: '50%' },
  { prop: 'object-fit', value: 'cover' },
  { prop: 'background', value: 'linear-gradient(...)' },
]

const measure = () => {
  if (btnRef.value && contentRef.value) {
    const btnRect = btnRef.value.getBoundingClientRect()
    const contentRect = contentRef.value.getBoundingClientRect()
    const newPos = {
      x: btnRect.left - contentRect.left,
      y: btnRect.top - contentRect.top,
      width: btnRect.width,
      height: btnRect.height,
    }
    btnPosRef.value = newPos
    btnPos.value = newPos
  }
}

watch(showPopup, (visible) => {
  if (visible && chevronRef.value && contentRef.value) {
    setTimeout(() => {
      if (chevronRef.value && contentRef.value) {
        const chevronRect = chevronRef.value.getBoundingClientRect()
        const contentRect = contentRef.value.getBoundingClientRect()
        chevronPosRef.value = {
          x: chevronRect.left - contentRect.left + chevronRect.width / 2,
          y: chevronRect.top - contentRect.top + chevronRect.height / 2,
        }
      }
    }, 50)
  }
})

let cancelled = false
let interval: ReturnType<typeof setInterval> | null = null

const runAnimation = async () => {
  cursorPos.value = { x: 300, y: 80 }
  showHighlight.value = false
  showPopup.value = false
  showMarker.value = false
  typedText.value = ''
  isCrosshair.value = true
  isStylesExpanded.value = false

  await delay(600)
  if (cancelled) return

  const pos = btnPosRef.value
  cursorPos.value = { x: pos.x + pos.width / 2, y: pos.y + pos.height / 2 }
  await delay(400)
  if (cancelled) return

  showHighlight.value = true
  await delay(300)
  if (cancelled) return

  await delay(200)
  if (cancelled) return
  showPopup.value = true
  await delay(400)
  if (cancelled) return

  isCrosshair.value = false
  const chevronPos = chevronPosRef.value
  cursorPos.value = { x: chevronPos.x, y: chevronPos.y }
  await delay(400)
  if (cancelled) return

  isStylesExpanded.value = true
  await delay(1200)
  if (cancelled) return

  isStylesExpanded.value = false
  await delay(400)
  if (cancelled) return

  isCrosshair.value = true
  cursorPos.value = { x: 180, y: 168 }
  await delay(300)
  if (cancelled) return

  for (let i = 0; i <= feedbackText.length; i++) {
    if (cancelled) return
    typedText.value = feedbackText.slice(0, i)
    await delay(35)
  }
  await delay(400)
  if (cancelled) return

  showPopup.value = false
  await delay(200)
  if (cancelled) return
  showMarker.value = true

  await delay(2000)
  if (cancelled) return

  showMarker.value = false
  showHighlight.value = false
  await delay(300)
}

const handleVisibility = () => {
  if (document.visibilityState === 'visible') {
    cancelled = true
    if (interval) clearInterval(interval)
    setTimeout(() => {
      cancelled = false
      runAnimation()
      interval = setInterval(runAnimation, 10000)
    }, 100)
  }
}

onMounted(() => {
  setTimeout(measure, 100)
  window.addEventListener('resize', measure)
  document.addEventListener('visibilitychange', handleVisibility)

  runAnimation()
  interval = setInterval(runAnimation, 10000)
})

onUnmounted(() => {
  cancelled = true
  if (interval) clearInterval(interval)
  window.removeEventListener('resize', measure)
  document.removeEventListener('visibilitychange', handleVisibility)
})
</script>

<template>
  <div class="fd-container">
    <div class="demo-window">
      <div class="demo-browser-bar">
        <div class="demo-dot" />
        <div class="demo-dot" />
        <div class="demo-dot" />
        <div class="demo-url">localhost:3000/settings</div>
      </div>

      <div class="demo-content" ref="contentRef">
        <div class="csd-profile-card">
          <div ref="btnRef" class="csd-avatar" />
          <div class="csd-profile-info">
            <div class="csd-name" />
            <div class="csd-email" />
          </div>
          <div class="csd-edit-btn" />
        </div>
        <div class="csd-stats-row">
          <div class="csd-stat">
            <div class="csd-stat-value" />
            <div class="csd-stat-label" />
          </div>
          <div class="csd-stat">
            <div class="csd-stat-value short" />
            <div class="csd-stat-label" />
          </div>
          <div class="csd-stat">
            <div class="csd-stat-value" />
            <div class="csd-stat-label" />
          </div>
        </div>

        <div
          :class="['csd-highlight', { visible: showHighlight }]"
          :style="{ top: btnPos.y - 4 + 'px', left: btnPos.x - 4 + 'px', width: btnPos.width + 8 + 'px', height: btnPos.height + 8 + 'px' }"
        />
        <div
          :class="['demo-marker', { visible: showMarker }]"
          :style="{ top: btnPos.y + btnPos.height / 2 + 'px', left: btnPos.x + btnPos.width / 2 + 'px' }"
        >1</div>

        <div :class="['demo-popup csd-popup', { visible: showPopup }]" style="top: 55px; left: 35%">
          <div class="csd-popup-header">
            <button ref="chevronRef" class="csd-toggle-btn" type="button">
              <svg
                :class="['csd-chevron', { expanded: isStylesExpanded }]"
                width="12"
                height="12"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M5.5 10.25L9 7.25L5.75 4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="csd-element">&lt;img.avatar&gt;</span>
            </button>
          </div>

          <div :class="['csd-styles-wrapper', { expanded: isStylesExpanded }]">
            <div class="csd-styles-inner">
              <div class="csd-styles-block">
                <div v-for="style in computedStyles" :key="style.prop" class="csd-style-line">
                  <span class="csd-style-prop">{{ style.prop }}</span>
                  : <span class="csd-style-value">{{ style.value }}</span>;
                </div>
              </div>
            </div>
          </div>

          <div class="demo-popup-input">
            {{ typedText }}<span style="opacity: 0.4">|</span>
          </div>
          <div class="demo-popup-actions">
            <div class="demo-popup-btn cancel">Cancel</div>
            <div class="demo-popup-btn submit">Add</div>
          </div>
        </div>

        <div class="demo-cursor" :style="{ left: cursorPos.x + 'px', top: cursorPos.y + 'px' }">
          <div :class="['demo-cursor-pointer', { hidden: isCrosshair }]">
            <svg height="24" width="24" viewBox="0 0 32 32">
              <g fill="none" fill-rule="evenodd" transform="translate(10 7)">
                <path d="m6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.316-3.221z" fill="#fff"/>
                <path d="m6.431 17 1.765-.941-2.775-5.202h3.604l-8.025-8.043v11.188l2.53-2.442z" fill="#000"/>
              </g>
            </svg>
          </div>
          <div :class="['demo-cursor-crosshair', { hidden: !isCrosshair }]">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <line x1="8.5" y1="0" x2="8.5" y2="17" stroke="black" stroke-width="1"/>
              <line x1="0" y1="8.5" x2="17" y2="8.5" stroke="black" stroke-width="1"/>
            </svg>
          </div>
        </div>

        <div class="demo-toolbar">
          <div class="demo-toolbar-buttons">
            <ToolbarIcon icon="pause" />
            <ToolbarIcon icon="eye" :disabled="!showMarker" />
            <ToolbarIcon icon="copy" :disabled="!showMarker" />
            <ToolbarIcon icon="trash" :disabled="!showMarker" />
            <ToolbarIcon icon="settings" />
            <div class="demo-toolbar-divider" />
            <ToolbarIcon icon="close" />
          </div>
        </div>
      </div>
    </div>

    <p style="margin-top: 1rem; font-size: 0.75rem; color: rgba(0,0,0,0.5); white-space: pre-line; line-height: 1.3">
      {{ t('computedStyles.caption') }}
    </p>
  </div>
</template>
