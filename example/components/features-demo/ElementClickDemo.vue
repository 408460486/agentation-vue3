<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ToolbarIcon from './ToolbarIcon.vue'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const cursorPos = ref({ x: 350, y: 80 })
const showHighlight = ref(false)
const showPopup = ref(false)
const showMarker = ref(false)
const typedText = ref('')
const isCrosshair = ref(false)
const btnPos = ref({ x: 20, y: 181, width: 330, height: 32 })

const btnRef = ref<HTMLDivElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)
const btnPosRef = ref({ x: 20, y: 181, width: 330, height: 32 })

const feedbackText = 'Make this more prominent'

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

let cancelled = false
let interval: ReturnType<typeof setInterval> | null = null

const runAnimation = async () => {
  cursorPos.value = { x: 350, y: 80 }
  showHighlight.value = false
  showPopup.value = false
  showMarker.value = false
  typedText.value = ''
  isCrosshair.value = true

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
  await delay(300)
}

const handleVisibility = () => {
  if (document.visibilityState === 'visible') {
    cancelled = true
    if (interval) clearInterval(interval)
    setTimeout(() => {
      cancelled = false
      runAnimation()
      interval = setInterval(runAnimation, 8000)
    }, 100)
  }
}

onMounted(() => {
  setTimeout(measure, 100)
  window.addEventListener('resize', measure)
  document.addEventListener('visibilitychange', handleVisibility)

  runAnimation()
  interval = setInterval(runAnimation, 8000)
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
      <div class="demo-url">localhost:3000/account</div>
    </div>

    <div class="demo-content" ref="contentRef">
      <div class="ecd-faux-title" />
      <div class="ecd-plan-card">
        <div class="ecd-plan-header">
          <div class="ecd-faux-badge" />
          <div class="ecd-plan-usage">
            <div class="ecd-faux-label" />
            <div class="ecd-faux-value" />
          </div>
        </div>
        <div class="ecd-plan-progress">
          <div class="ecd-plan-progress-fill" />
        </div>
        <div class="ecd-plan-features">
          <div class="ecd-feature">
            <div class="ecd-faux-check" />
            <div class="ecd-faux-text" :style="{ width: '50px' }" />
          </div>
          <div class="ecd-feature">
            <div class="ecd-faux-check" />
            <div class="ecd-faux-text" :style="{ width: '70px' }" />
          </div>
          <div class="ecd-feature disabled">
            <div class="ecd-faux-x" />
            <div class="ecd-faux-text" :style="{ width: '80px' }" />
          </div>
        </div>
        <div class="ecd-upgrade-btn" ref="btnRef" />
      </div>

      <div
        :class="['ecd-highlight', { visible: showHighlight }]"
        :style="{ top: btnPos.y - 4 + 'px', left: btnPos.x - 4 + 'px', width: btnPos.width + 8 + 'px', height: btnPos.height + 8 + 'px' }"
      />
      <div
        :class="['demo-marker', { visible: showMarker }]"
        :style="{ top: btnPos.y + btnPos.height / 2 + 'px', left: btnPos.x + btnPos.width / 2 + 'px' }"
      >1</div>

      <div :class="['demo-popup ecd-popup', { visible: showPopup }]" style="top: 115px">
        <div class="demo-popup-header">&lt;button.upgrade-btn&gt;</div>
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
</template>
