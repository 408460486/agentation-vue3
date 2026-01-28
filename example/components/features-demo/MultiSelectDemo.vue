<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ToolbarIcon from './ToolbarIcon.vue'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const cursorPos = ref({ x: 300, y: 180 })
const dragBox = ref({ visible: false, x: 0, y: 0, width: 0, height: 0 })
const selectedItems = ref<number[]>([])
const showPopup = ref(false)
const showMarkers = ref(false)
const typedText = ref('')
const isCrosshair = ref(false)
const isDragging = ref(false)

const feedbackText = 'Add priority labels'

let cancelled = false
let interval: ReturnType<typeof setInterval> | null = null

const runAnimation = async () => {
  cursorPos.value = { x: 300, y: 180 }
  dragBox.value = { visible: false, x: 0, y: 0, width: 0, height: 0 }
  selectedItems.value = []
  showPopup.value = false
  showMarkers.value = false
  typedText.value = ''
  isCrosshair.value = true
  isDragging.value = false

  await delay(600)
  if (cancelled) return

  cursorPos.value = { x: 10, y: 148 }
  await delay(400)
  if (cancelled) return

  await delay(200)
  if (cancelled) return

  isDragging.value = true
  const startX = 15
  const startY = 153
  const endX = 200
  const endY = 63
  const steps = 20

  dragBox.value = { visible: true, x: startX, y: startY, width: 0, height: 0 }

  for (let i = 0; i <= steps; i++) {
    if (cancelled) return
    const progress = i / steps
    const currentX = startX + (endX - startX) * progress
    const currentY = startY + (endY - startY) * progress

    cursorPos.value = { x: currentX, y: currentY }

    const boxTop = Math.min(startY, currentY)
    const boxHeight = Math.abs(currentY - startY)
    dragBox.value = {
      visible: true,
      x: startX,
      y: boxTop,
      width: currentX - startX,
      height: boxHeight,
    }

    if (progress > 0.3 && !selectedItems.value.includes(2)) selectedItems.value.push(2)
    if (progress > 0.5 && !selectedItems.value.includes(1)) selectedItems.value.push(1)
    if (progress > 0.7 && !selectedItems.value.includes(0)) selectedItems.value.push(0)

    await delay(25)
  }

  await delay(200)
  if (cancelled) return

  isDragging.value = false
  dragBox.value = { visible: false, x: 0, y: 0, width: 0, height: 0 }
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
  showMarkers.value = true

  await delay(2500)
  if (cancelled) return

  showMarkers.value = false
  selectedItems.value = []
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
      <div class="demo-url">localhost:3000/tasks</div>
    </div>

    <div class="demo-content">
      <div class="msd-faux-title" />
      <div class="msd-items">
        <div
          v-for="(width, i) in [100, 80, 65]"
          :key="i"
          :class="['msd-item', { selected: selectedItems.includes(i) }]"
        >
          <div class="msd-checkbox" />
          <div class="msd-faux-text" :style="{ width: width + 'px' }" />
        </div>
      </div>

      <div
        v-if="dragBox.visible"
        class="msd-drag-box"
        :style="{
          left: dragBox.x + 'px',
          top: dragBox.y + 'px',
          width: dragBox.width + 'px',
          height: dragBox.height + 'px',
        }"
      />

      <div
        :class="['demo-marker green', { visible: showMarkers }]"
        style="top: 63px; left: 200px"
      >1</div>

      <div :class="['demo-popup', { visible: showPopup }]" style="top: 100px">
        <div class="demo-popup-header">3 elements selected</div>
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
          <ToolbarIcon icon="eye" :disabled="!showMarkers" />
          <ToolbarIcon icon="copy" :disabled="!showMarkers" />
          <ToolbarIcon icon="trash" :disabled="!showMarkers" />
          <ToolbarIcon icon="settings" />
          <div class="demo-toolbar-divider" />
          <ToolbarIcon icon="close" />
        </div>
      </div>
    </div>
  </div>
</template>
