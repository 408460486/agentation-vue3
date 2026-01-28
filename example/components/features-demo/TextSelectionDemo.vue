<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ToolbarIcon from './ToolbarIcon.vue'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const typedText = ref('')
const cursorPos = ref({ x: 300, y: 180 })
const showSelection = ref(false)
const selectionWidth = ref(0)
const showPopup = ref(false)
const showMarker = ref(false)
const isTextCursor = ref(false)
const isSelecting = ref(false)
const wordPos = ref({ x: 52, y: 57, width: 44 })

const wordRef = ref<HTMLSpanElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)
const wordPosRef = ref({ x: 52, y: 57, width: 44 })

const feedbackText = 'Fix typo'

const measure = () => {
  if (wordRef.value && contentRef.value) {
    const wordRect = wordRef.value.getBoundingClientRect()
    const contentRect = contentRef.value.getBoundingClientRect()
    const newPos = {
      x: wordRect.left - contentRect.left,
      y: wordRect.top - contentRect.top,
      width: wordRect.width,
    }
    wordPosRef.value = newPos
    wordPos.value = newPos
  }
}

const actualCursorX = computed(() =>
  isSelecting.value ? wordPos.value.x + selectionWidth.value : cursorPos.value.x
)

let cancelled = false
let interval: ReturnType<typeof setInterval> | null = null

const runAnimation = async () => {
  typedText.value = ''
  cursorPos.value = { x: 300, y: 180 }
  showSelection.value = false
  selectionWidth.value = 0
  showPopup.value = false
  showMarker.value = false
  isTextCursor.value = false
  isSelecting.value = false

  await delay(600)
  if (cancelled) return

  const pos = wordPosRef.value
  cursorPos.value = { x: pos.x, y: pos.y }
  await delay(180)
  if (cancelled) return
  isTextCursor.value = true
  await delay(250)
  if (cancelled) return

  isSelecting.value = true
  showSelection.value = true

  const endWidth = pos.width
  const steps = 14
  const stepSize = endWidth / steps

  for (let i = 0; i <= steps; i++) {
    if (cancelled) return
    const w = Math.round(i * stepSize)
    selectionWidth.value = w
    await delay(20)
  }

  cursorPos.value = { x: pos.x + endWidth, y: pos.y }
  isSelecting.value = false
  await delay(250)
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

  await delay(1800)
  if (cancelled) return

  showMarker.value = false
  showSelection.value = false
  await delay(200)
}

const handleVisibility = () => {
  if (document.visibilityState === 'visible') {
    cancelled = true
    if (interval) clearInterval(interval)
    setTimeout(() => {
      cancelled = false
      runAnimation()
      interval = setInterval(runAnimation, 7000)
    }, 100)
  }
}

onMounted(() => {
  setTimeout(measure, 100)
  window.addEventListener('resize', measure)
  document.addEventListener('visibilitychange', handleVisibility)

  runAnimation()
  interval = setInterval(runAnimation, 6000)
})

onUnmounted(() => {
  cancelled = true
  if (interval) clearInterval(interval)
  window.removeEventListener('resize', measure)
  document.removeEventListener('visibilitychange', handleVisibility)
})
</script>

<template>
  <div class="demo-window text-demo">
    <div class="demo-browser-bar">
      <div class="demo-dot" />
      <div class="demo-dot" />
      <div class="demo-dot" />
      <div class="demo-url">localhost:3000/blog</div>
    </div>

    <div class="demo-content" ref="contentRef">
      <p class="demo-quote">
        "Simple can be harder than complex: You have to work hard to get your thinking clean to make it <span ref="wordRef">simpl</span>. But it's worth it in the end because once you get there, you can move mountains."
      </p>
      <p class="demo-quote-author">— Steve Jobs</p>

      <div
        :class="['tsd-highlight', { visible: showSelection }]"
        :style="{ left: wordPos.x - 2 + 'px', top: wordPos.y - 1 + 'px', width: selectionWidth + 4 + 'px', height: '16px' }"
      />
      <div
        :class="['demo-marker', { visible: showMarker }]"
        :style="{ top: wordPos.y + 1 + 'px', left: wordPos.x + wordPos.width + 'px' }"
      >1</div>

      <div :class="['demo-popup', { visible: showPopup }]">
        <div class="demo-popup-header">"simpl"</div>
        <div class="demo-popup-input">
          {{ typedText }}<span style="opacity: 0.4">|</span>
        </div>
        <div class="demo-popup-actions">
          <div class="demo-popup-btn cancel">Cancel</div>
          <div class="demo-popup-btn submit">Add</div>
        </div>
      </div>

      <div :class="['demo-cursor', { selecting: isSelecting }]" :style="{ left: actualCursorX + 'px', top: cursorPos.y + 'px' }">
        <div :class="['demo-cursor-crosshair', { hidden: isTextCursor }]">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <line x1="8.5" y1="0" x2="8.5" y2="17" stroke="black" stroke-width="1"/>
            <line x1="0" y1="8.5" x2="17" y2="8.5" stroke="black" stroke-width="1"/>
          </svg>
        </div>
        <div :class="['demo-cursor-text', { hidden: !isTextCursor }]">
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M3 1H7M3 15H7M5 1V15" stroke="#000" stroke-width="1" stroke-linecap="round"/>
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
