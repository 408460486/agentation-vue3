<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ToolbarIcon from './ToolbarIcon.vue'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const cursorPos = ref({ x: 300, y: 180 })
const dragBox = ref({ visible: false, x: 0, y: 0, width: 0, height: 0 })
const areaOutline = ref({ visible: false, x: 0, y: 0, width: 0, height: 0 })
const showPopup = ref(false)
const showMarker = ref(false)
const typedText = ref('')
const isCrosshair = ref(false)
const isDragging = ref(false)

const feedbackText = 'Add chart here'

let cancelled = false
let interval: ReturnType<typeof setInterval> | null = null

const runAnimation = async () => {
  cursorPos.value = { x: 300, y: 180 }
  dragBox.value = { visible: false, x: 0, y: 0, width: 0, height: 0 }
  areaOutline.value = { visible: false, x: 0, y: 0, width: 0, height: 0 }
  showPopup.value = false
  showMarker.value = false
  typedText.value = ''
  isCrosshair.value = true
  isDragging.value = false

  await delay(600)
  if (cancelled) return

  cursorPos.value = { x: 25, y: 115 }
  await delay(400)
  if (cancelled) return

  await delay(200)
  if (cancelled) return

  isDragging.value = true
  const startX = 30
  const startY = 120
  const endX = 350
  const endY = 175
  const steps = 16

  dragBox.value = { visible: true, x: startX, y: startY, width: 0, height: 0 }

  for (let i = 0; i <= steps; i++) {
    if (cancelled) return
    const progress = i / steps
    const currentX = startX + (endX - startX) * progress
    const currentY = startY + (endY - startY) * progress

    cursorPos.value = { x: currentX, y: currentY }
    dragBox.value = {
      visible: true,
      x: startX,
      y: startY,
      width: currentX - startX,
      height: currentY - startY,
    }

    await delay(25)
  }

  await delay(200)
  if (cancelled) return

  isDragging.value = false
  dragBox.value = { visible: false, x: 0, y: 0, width: 0, height: 0 }
  areaOutline.value = {
    visible: true,
    x: startX,
    y: startY,
    width: endX - startX,
    height: endY - startY,
  }
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
  areaOutline.value = { visible: false, x: 0, y: 0, width: 0, height: 0 }
  await delay(300)
}

const handleVisibility = () => {
  if (document.visibilityState === 'visible') {
    cancelled = true
    if (interval) clearInterval(interval)
    setTimeout(() => {
      cancelled = false
      runAnimation()
      interval = setInterval(runAnimation, 9000)
    }, 100)
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibility)
  runAnimation()
  interval = setInterval(runAnimation, 9000)
})

onUnmounted(() => {
  cancelled = true
  if (interval) clearInterval(interval)
  document.removeEventListener('visibilitychange', handleVisibility)
})
</script>

<template>
  <div class="demo-window">
    <div class="demo-browser-bar">
      <div class="demo-dot" />
      <div class="demo-dot" />
      <div class="demo-dot" />
      <div class="demo-url">localhost:3000/landing</div>
    </div>

    <div class="demo-content">
      <div class="asd-header">
        <div class="asd-header-left">
          <div class="asd-logo" />
          <div class="asd-faux-title" />
        </div>
        <div class="asd-faux-btn" />
      </div>
      <div class="asd-stats-row">
        <div class="asd-stat-card">
          <div class="asd-faux-label" />
          <div class="asd-faux-value" />
        </div>
        <div class="asd-stat-card">
          <div class="asd-faux-label" :style="{ width: '38px' }" />
          <div class="asd-faux-value" :style="{ width: '50px' }" />
        </div>
        <div class="asd-stat-card">
          <div class="asd-faux-label" :style="{ width: '30px' }" />
          <div class="asd-faux-value" :style="{ width: '38px' }" />
        </div>
      </div>
      <div class="asd-empty-section" />

      <div
        v-if="dragBox.visible"
        class="asd-drag-box"
        :style="{
          left: dragBox.x + 'px',
          top: dragBox.y + 'px',
          width: dragBox.width + 'px',
          height: dragBox.height + 'px',
        }"
      />

      <div
        :class="['asd-area-outline', { visible: areaOutline.visible }]"
        :style="{ top: areaOutline.y + 'px', left: areaOutline.x + 'px', width: areaOutline.width + 'px', height: areaOutline.height + 'px' }"
      />

      <div
        :class="['demo-marker green', { visible: showMarker }]"
        style="top: 148px; left: 350px"
      >1</div>

      <div :class="['demo-popup', { visible: showPopup }]" style="top: 65px">
        <div class="demo-popup-header">Area selection</div>
        <div class="demo-popup-input">
          {{ typedText }}<span style="opacity: 0.4">|</span>
        </div>
        <div class="demo-popup-actions">
          <div class="demo-popup-btn cancel">Cancel</div>
          <div class="demo-popup-btn submit green">Add</div>
        </div>
      </div>

      <div :class="['demo-cursor', { dragging: isDragging }]" :style="{ left: cursorPos.x + 'px', top: cursorPos.y + 'px' }">
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
