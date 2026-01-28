<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const cursorPos = ref({ x: 100, y: 80 })
const activeElement = ref<string | null>(null)
const activeCaption = ref('button')
const showLabel = ref(false)
const labelPos = ref({ x: 0, y: 0, below: false })

const contentRef = ref<HTMLDivElement | null>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)
const linkRef = ref<HTMLAnchorElement | null>(null)
const headingRef = ref<HTMLHeadingElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const cardRef = ref<HTMLDivElement | null>(null)

const labels: Record<string, string> = {
  button: 'button.Follow',
  link: 'a.benji.org',
  heading: 'h3.Benji Taylor',
  image: 'img[alt="avatar"]',
  input: 'input[placeholder]',
  card: '.header-banner',
}

const captions: Record<string, string> = {
  button: 'Buttons and links are named by their text content.',
  link: 'Buttons and links are named by their text content.',
  heading: 'Headings are identified by their content.',
  image: 'Images use alt text or src filename.',
  input: 'Inputs use labels or placeholder text.',
  card: 'Other elements use class names or IDs.',
}

const getElementPosition = (el: HTMLElement | null, preferBelow = false) => {
  if (!el || !contentRef.value) return null
  const contentRect = contentRef.value.getBoundingClientRect()
  const rect = el.getBoundingClientRect()

  const cursorX = rect.left - contentRect.left + 14
  const cursorY = rect.top - contentRect.top + 14

  const rawLabelX = rect.left - contentRect.left + rect.width / 2
  const labelX = Math.max(70, Math.min(rawLabelX, contentRect.width - 70))

  const spaceAbove = rect.top - contentRect.top
  const below = preferBelow || spaceAbove < 30
  const labelY = below
    ? Math.min(rect.bottom - contentRect.top + 8, contentRect.height - 30)
    : Math.max(rect.top - contentRect.top - 8, 30)

  return { cursorX, cursorY, labelX, labelY, below }
}

let cancelled = false
let interval: ReturnType<typeof setInterval> | null = null

const hoverElement = async (
  element: string,
  el: HTMLElement | null,
  preferBelow = false,
  duration: number = 1600
) => {
  if (cancelled) return
  showLabel.value = false
  activeElement.value = null
  activeCaption.value = element

  const pos = getElementPosition(el, preferBelow)
  if (!pos) return

  cursorPos.value = { x: pos.cursorX, y: pos.cursorY }

  await delay(400)
  if (cancelled) return

  activeElement.value = element
  labelPos.value = { x: pos.labelX, y: pos.labelY, below: pos.below }
  showLabel.value = true

  await delay(duration)
  if (cancelled) return

  showLabel.value = false
  activeElement.value = null
  await delay(60)
}

const runAnimation = async () => {
  cursorPos.value = { x: 100, y: 80 }
  activeElement.value = null
  showLabel.value = false

  await delay(400)
  if (cancelled) return

  await hoverElement('button', buttonRef.value, true)
  if (cancelled) return

  await hoverElement('link', linkRef.value, true)
  if (cancelled) return

  await hoverElement('heading', headingRef.value, true)
  if (cancelled) return

  await hoverElement('image', imageRef.value)
  if (cancelled) return

  await hoverElement('input', inputRef.value)
  if (cancelled) return

  await hoverElement('card', cardRef.value)
  if (cancelled) return

  await delay(500)
}

const handleVisibility = () => {
  if (document.visibilityState === 'visible') {
    cancelled = true
    if (interval) clearInterval(interval)
    setTimeout(() => {
      cancelled = false
      runAnimation()
      interval = setInterval(runAnimation, 14000)
    }, 100)
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibility)
  runAnimation()
  interval = setInterval(runAnimation, 14000)
})

onUnmounted(() => {
  cancelled = true
  if (interval) clearInterval(interval)
  document.removeEventListener('visibilitychange', handleVisibility)
})
</script>

<template>
  <div class="fd-container">
    <div class="demo-window sid-demo">
      <div class="demo-browser-bar">
        <div class="demo-dot" />
        <div class="demo-dot" />
        <div class="demo-dot" />
        <div class="demo-url">localhost:3000/@benjitaylor</div>
      </div>

      <div class="demo-content sid-page" ref="contentRef">
        <!-- Banner -->
        <div ref="cardRef" :class="['sid-banner', { hovered: activeElement === 'card' }]" />

        <!-- Avatar -->
        <img
          ref="imageRef"
          src="/demo-avatar.png"
          alt="avatar"
          :class="['sid-avatar', { hovered: activeElement === 'image' }]"
        />

        <!-- Follow button -->
        <button ref="buttonRef" :class="['sid-follow-btn', { hovered: activeElement === 'button' }]">
          Follow
        </button>

        <!-- Profile info -->
        <div class="sid-profile-info">
          <h3 ref="headingRef" :class="['sid-name', { hovered: activeElement === 'heading' }]">
            Benji Taylor
          </h3>
          <span class="sid-handle">@benjitaylor</span>
          <p class="sid-bio">head of design <span class="sid-mention">@base</span>. founder <span class="sid-mention">@family</span> (acq by <span class="sid-mention">@aave</span>). tools <span class="sid-mention">@dip</span>.</p>
          <div class="sid-meta">
            <span class="sid-location">Los Angeles, CA</span>
            <a ref="linkRef" :class="['sid-link', { hovered: activeElement === 'link' }]">
              benji.org
            </a>
          </div>
          <div class="sid-stats">
            <span><strong>394</strong> Following</span>
            <span><strong>28.3K</strong> Followers</span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="sid-tabs">
          <input
            ref="inputRef"
            type="text"
            placeholder="Search posts"
            :class="['sid-search', { hovered: activeElement === 'input' }]"
            readonly
          />
        </div>

        <!-- Label -->
        <div
          v-if="showLabel && activeElement"
          :class="['sid-label', labelPos.below ? 'below' : 'above']"
          :style="{ left: labelPos.x + 'px', top: labelPos.y + 'px' }"
        >
          {{ labels[activeElement] }}
        </div>

        <!-- Cursor -->
        <div class="demo-cursor" :style="{ left: cursorPos.x + 'px', top: cursorPos.y + 'px' }">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <line x1="8.5" y1="0" x2="8.5" y2="17" stroke="black" stroke-width="1"/>
            <line x1="0" y1="8.5" x2="17" y2="8.5" stroke="black" stroke-width="1"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Caption -->
    <p :key="activeCaption" style="margin-top: 1rem; font-size: 0.75rem; color: rgba(0,0,0,0.5); line-height: 1.5; animation: fadeIn 0.3s ease">
      {{ captions[activeCaption] }}
    </p>
  </div>
</template>
