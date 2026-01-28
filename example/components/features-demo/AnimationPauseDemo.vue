<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ToolbarIcon from './ToolbarIcon.vue'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const cursorPos = ref({ x: 300, y: 100 })
const isPaused = ref(false)
const showHighlight = ref(false)
const showPopup = ref(false)
const showMarker = ref(false)
const typedText = ref('')
const isCrosshair = ref(false)
const progressPos = ref({ x: 20, y: 138, width: 330, height: 12 })
const pauseBtnPos = ref({ x: 218, y: 275, width: 28, height: 28 })

const progressRef = ref<HTMLDivElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)
const pauseBtnRef = ref<HTMLDivElement | null>(null)
const progressPosRef = ref({ x: 20, y: 138, width: 330, height: 12 })
const pauseBtnPosRef = ref({ x: 218, y: 275, width: 28, height: 28 })

const feedbackText = 'Skeleton pulses too fast'

const measure = () => {
  if (progressRef.value && contentRef.value) {
    const progressRect = progressRef.value.getBoundingClientRect()
    const contentRect = contentRef.value.getBoundingClientRect()
    const newPos = {
      x: progressRect.left - contentRect.left,
      y: progressRect.top - contentRect.top,
      width: progressRect.width,
      height: progressRect.height,
    }
    progressPosRef.value = newPos
    progressPos.value = newPos
  }
  if (pauseBtnRef.value && contentRef.value) {
    const btnRect = pauseBtnRef.value.getBoundingClientRect()
    const contentRect = contentRef.value.getBoundingClientRect()
    const newPos = {
      x: btnRect.left - contentRect.left,
      y: btnRect.top - contentRect.top,
      width: btnRect.width,
      height: btnRect.height,
    }
    pauseBtnPosRef.value = newPos
    pauseBtnPos.value = newPos
  }
}

let cancelled = false
let interval: ReturnType<typeof setInterval> | null = null

const runAnimation = async () => {
  cursorPos.value = { x: 300, y: 100 }
  isPaused.value = false
  showHighlight.value = false
  showPopup.value = false
  showMarker.value = false
  typedText.value = ''
  isCrosshair.value = true

  await delay(800)
  if (cancelled) return

  isCrosshair.value = false
  const pausePos = pauseBtnPosRef.value
  cursorPos.value = { x: pausePos.x + pausePos.width / 2, y: pausePos.y + pausePos.height / 2 }
  await delay(450)
  if (cancelled) return

  await delay(150)
  if (cancelled) return
  isPaused.value = true
  await delay(500)
  if (cancelled) return

  isCrosshair.value = true
  const pos = progressPosRef.value
  cursorPos.value = { x: pos.x + pos.width / 2, y: pos.y + pos.height / 2 }
  await delay(450)
  if (cancelled) return

  showHighlight.value = true
  await delay(300)
  if (cancelled) return

  showPopup.value = true
  await delay(300)
  if (cancelled) return

  for (let i = 0; i <= feedbackText.length; i++) {
    if (cancelled) return
    typedText.value = feedbackText.slice(0, i)
    await delay(30)
  }
  await delay(400)
  if (cancelled) return

  showPopup.value = false
  await delay(200)
  if (cancelled) return
  showMarker.value = true

  await delay(2500)
  if (cancelled) return

  showMarker.value = false
  showHighlight.value = false
  isPaused.value = false
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
  <div class="demo-window">
    <div class="demo-browser-bar">
      <div class="demo-dot" />
      <div class="demo-dot" />
      <div class="demo-dot" />
      <div class="demo-url">localhost:3000/upload</div>
    </div>

    <div class="demo-content" ref="contentRef">
      <div class="apd-skeleton-card" ref="progressRef">
        <div :class="['apd-skeleton-avatar', { paused: isPaused }]" />
        <div class="apd-skeleton-lines">
          <div :class="['apd-skeleton-line', { paused: isPaused }]" style="width: 70%" />
          <div :class="['apd-skeleton-line short', { paused: isPaused }]" style="width: 45%" />
        </div>
      </div>
      <div class="apd-skeleton-card">
        <div :class="['apd-skeleton-avatar', { paused: isPaused }]" />
        <div class="apd-skeleton-lines">
          <div :class="['apd-skeleton-line', { paused: isPaused }]" style="width: 85%" />
          <div :class="['apd-skeleton-line short', { paused: isPaused }]" style="width: 55%" />
        </div>
      </div>

      <div
        :class="['apd-highlight', { visible: showHighlight }]"
        :style="{ top: progressPos.y - 4 + 'px', left: progressPos.x - 4 + 'px', width: progressPos.width + 8 + 'px', height: progressPos.height + 8 + 'px' }"
      />
      <div
        :class="['demo-marker', { visible: showMarker }]"
        :style="{ top: progressPos.y + progressPos.height / 2 + 'px', left: progressPos.x + progressPos.width / 2 + 'px' }"
      >1</div>

      <div :class="['demo-popup', { visible: showPopup }]" style="top: 70px">
        <div class="demo-popup-header">&lt;div.skeleton-card&gt;</div>
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
          <div ref="pauseBtnRef" style="display: flex">
            <ToolbarIcon :icon="isPaused ? 'play' : 'pause'" :active="isPaused" />
          </div>
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
</template>
