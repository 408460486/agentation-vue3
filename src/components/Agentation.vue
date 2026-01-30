<script setup lang="ts">
// =============================================================================
// Agentation.vue - Vue 3 version of PageFeedbackToolbarCSS
// =============================================================================

import { ref, computed, onMounted, onUnmounted, watch, useCssModule } from 'vue'
import type { Annotation } from '../types'
import AnnotationPopup from './AnnotationPopup.vue'
import {
  IconListSparkle,
  IconPausePlayAnimated,
  IconEyeAnimated,
  IconCopyAnimated,
  IconTrashAlt,
  IconXmarkLarge,
  IconGear,
  IconHelp,
  IconCheckSmallAnimated,
  IconSun,
  IconMoon,
  IconPlus,
} from './icons'
import {
  identifyElement,
  getNearbyText,
  getElementClasses,
  getDetailedComputedStyles,
  getForensicComputedStyles,
  getFullElementPath,
  getAccessibilityInfo,
  getNearbyElements,
} from '../utils/element-identification'
import {
  loadAnnotations,
  saveAnnotations,
  getStorageKey,
} from '../utils/storage'
import { version } from '../../package.json'

// Module-level flag to prevent re-animating on SPA page navigation
let hasPlayedEntranceAnimation = false

// =============================================================================
// Multi-select Constants | 多选常量
// =============================================================================

/** Drag threshold in pixels - must move this far to start drag selection */
const DRAG_THRESHOLD = 5

/** Throttle interval for element detection during drag (ms) */
const DETECTION_THROTTLE = 50

/** Minimum drag selection size to create annotation */
const MIN_DRAG_SIZE = 20

/** Text elements that should allow native text selection */
const TEXT_ELEMENTS = new Set([
  'P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'LI', 'TD', 'TH', 'LABEL', 'BLOCKQUOTE', 'FIGCAPTION',
  'CAPTION', 'LEGEND', 'DT', 'DD', 'PRE', 'CODE',
  'EM', 'STRONG', 'B', 'I', 'U', 'S', 'A',
  'TIME', 'ADDRESS', 'CITE', 'Q', 'ABBR', 'DFN',
  'MARK', 'SMALL', 'SUB', 'SUP',
])

/** Meaningful elements to detect during drag selection */
const MEANINGFUL_ELEMENTS = [
  'BUTTON', 'A', 'INPUT', 'IMG',
  'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'LI', 'LABEL', 'TD', 'TH',
]

// CSS Modules
const $style = useCssModule()

// =============================================================================
// Types
// =============================================================================

type HoverInfo = {
  element: string
  elementPath: string
  rect: DOMRect | null
}

type OutputDetailLevel = 'compact' | 'standard' | 'detailed' | 'forensic'

type ToolbarSettings = {
  outputDetail: OutputDetailLevel
  annotationColor: string
  autoClearAfterCopy: boolean
  blockInteractions: boolean
}

const OUTPUT_DETAIL_OPTIONS = [
  { value: 'compact' as const, label: 'Compact' },
  { value: 'standard' as const, label: 'Standard' },
  { value: 'detailed' as const, label: 'Detailed' },
  { value: 'forensic' as const, label: 'Forensic' },
]

const COLOR_OPTIONS = [
  { value: '#3c82f7', label: 'Blue' },
  { value: '#34c759', label: 'Green' },
  { value: '#ff9500', label: 'Orange' },
  { value: '#ff3b30', label: 'Red' },
  { value: '#af52de', label: 'Purple' },
]

const DEFAULT_SETTINGS: ToolbarSettings = {
  outputDetail: 'standard',
  annotationColor: '#3c82f7',
  autoClearAfterCopy: false,
  blockInteractions: false,
}

type PendingAnnotation = {
  x: number
  y: number
  clientY: number
  element: string
  elementPath: string
  selectedText?: string
  boundingBox?: { x: number; y: number; width: number; height: number }
  nearbyText?: string
  cssClasses?: string
  isFixed?: boolean
  fullPath?: string
  accessibility?: string
  computedStyles?: string
  computedStylesObj?: Record<string, string>
  nearbyElements?: string
  isMultiSelect?: boolean
}

// =============================================================================
// Props & Emits
// =============================================================================

export interface AgentationProps {
  /** Custom accent color (hex) */
  accentColor?: string
  /** Whether to copy to clipboard when the copy button is clicked */
  copyToClipboard?: boolean
  /** Light mode styling */
  lightMode?: boolean
  /** z-index for the toolbar */
  zIndex?: number
  /** Demo annotations to show on page load */
  demoAnnotations?: Array<{ selector: string; comment: string }>
  /** Delay before showing demo annotations (ms) */
  demoDelay?: number
  /** Enable demo mode */
  enableDemoMode?: boolean
}

const props = withDefaults(defineProps<AgentationProps>(), {
  accentColor: '#3c82f7',
  copyToClipboard: true,
  lightMode: false,
  zIndex: 2147483647,
  demoAnnotations: () => [],
  demoDelay: 1000,
  enableDemoMode: false,
})

const emit = defineEmits<{
  annotationAdd: [annotation: Annotation]
  annotationDelete: [annotation: Annotation]
  annotationUpdate: [annotation: Annotation]
  annotationsClear: [annotations: Annotation[]]
  copy: [markdown: string]
}>()

// =============================================================================
// State
// =============================================================================

const mounted = ref(false)
const isActive = ref(false)
const annotations = ref<Annotation[]>([])
const showMarkers = ref(true)
const hoverInfo = ref<HoverInfo | null>(null)
const hoverPosition = ref({ x: 0, y: 0 })
const pendingAnnotation = ref<PendingAnnotation | null>(null)
const editingAnnotation = ref<Annotation | null>(null)
const copied = ref(false)
const cleared = ref(false)
const hoveredMarkerId = ref<string | null>(null)
const isDarkMode = ref(true)
const showEntranceAnimation = ref(false)
const scrollY = ref(0)
const showSettings = ref(false)
const showSettingsVisible = ref(false)
const settings = ref<ToolbarSettings>({ ...DEFAULT_SETTINGS })
const isFrozen = ref(false)

// Draggable toolbar state
const toolbarPosition = ref<{ x: number; y: number } | null>(null)
const isDraggingToolbar = ref(false)
const dragStartPos = ref<{ x: number; y: number; toolbarX: number; toolbarY: number } | null>(null)
const dragRotation = ref(0)
let justFinishedToolbarDrag = false

// =============================================================================
// Multi-select State | 多选状态
// =============================================================================

/** Whether currently dragging to select elements */
const isDraggingSelection = ref(false)

/** Mouse position when drag started */
const dragSelectionStart = ref<{ x: number; y: number } | null>(null)

/** Current mouse position during drag */
const dragSelectionEnd = ref<{ x: number; y: number } | null>(null)

/** Elements currently highlighted during drag */
const dragSelectedElements = ref<Array<{ element: HTMLElement; rect: DOMRect }>>([])

/** Whether the initial mousedown was on a text element */
let isTextElementDrag = false

/** Timestamp of last element detection (for throttling) */
let lastDetectionTime = 0

/** Ref for mousedown position to avoid React state issues */
const mouseDownPosRef = ref<{ x: number; y: number } | null>(null)

/** Flag to prevent click handler from firing after drag selection */
let justFinishedDragSelection = false

// Refs
const popupRef = ref<InstanceType<typeof AnnotationPopup> | null>(null)
const editPopupRef = ref<InstanceType<typeof AnnotationPopup> | null>(null)

// Get current path - supports both hash and history router modes
// 获取当前路径 - 同时支持 hash 和 history 路由模式
const getCurrentPath = () => {
  if (typeof window === 'undefined') return '/'
  const hash = window.location.hash
  // Hash mode: #/path or #!/path
  if (hash && hash.startsWith('#')) {
    return hash.replace(/^#!?/, '') || '/'
  }
  // History mode: use pathname
  return window.location.pathname
}

// Reactive pathname - updates on SPA navigation
const pathname = ref(getCurrentPath())

// Update pathname on popstate (browser back/forward) and listen for route changes
const updatePathname = () => {
  pathname.value = getCurrentPath()
}


const hasAnnotations = computed(() => annotations.value.length > 0)

// Popup position calculation - show above if near bottom of viewport
const POPUP_HEIGHT = 290 // Approximate popup height including padding
const POPUP_WIDTH = 280 // Popup width
const EDGE_PADDING = 20 // Minimum distance from viewport edges

const pendingPopupStyle = computed((): Record<string, string> => {
  if (!pendingAnnotation.value) return { left: '0px', top: '0px' }
  const clientY = pendingAnnotation.value.clientY
  const xPercent = pendingAnnotation.value.x

  // Calculate horizontal position - clamp to keep popup in viewport
  const xPx = (xPercent / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1000)
  const clampedLeft = Math.max(
    POPUP_WIDTH / 2 + EDGE_PADDING,
    Math.min(
      (typeof window !== 'undefined' ? window.innerWidth : 1000) - POPUP_WIDTH / 2 - EDGE_PADDING,
      xPx
    )
  )

  // Determine if popup should appear above or below
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const shouldShowAbove = clientY > viewportHeight - POPUP_HEIGHT

  if (shouldShowAbove) {
    return {
      left: `${clampedLeft}px`,
      bottom: `${viewportHeight - clientY + 20}px`,
    }
  } else {
    return {
      left: `${clampedLeft}px`,
      top: `${clientY + 20}px`,
    }
  }
})

const editPopupStyle = computed((): Record<string, string> => {
  if (!editingAnnotation.value) return { left: '0px', top: '0px' }
  const annotation = editingAnnotation.value
  const markerY = annotation.isFixed ? annotation.y : annotation.y - scrollY.value
  const xPercent = annotation.x

  // Calculate horizontal position - clamp to keep popup in viewport
  const xPx = (xPercent / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1000)
  const clampedLeft = Math.max(
    POPUP_WIDTH / 2 + EDGE_PADDING,
    Math.min(
      (typeof window !== 'undefined' ? window.innerWidth : 1000) - POPUP_WIDTH / 2 - EDGE_PADDING,
      xPx
    )
  )

  // Determine if popup should appear above or below
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const shouldShowAbove = markerY > viewportHeight - POPUP_HEIGHT

  if (shouldShowAbove) {
    return {
      left: `${clampedLeft}px`,
      bottom: `${viewportHeight - markerY + 20}px`,
    }
  } else {
    return {
      left: `${clampedLeft}px`,
      top: `${markerY + 20}px`,
    }
  }
})

// =============================================================================
// Utils
// =============================================================================

function isElementFixed(element: HTMLElement): boolean {
  let current: HTMLElement | null = element
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current)
    if (style.position === 'fixed' || style.position === 'sticky') {
      return true
    }
    current = current.parentElement
  }
  return false
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// =============================================================================
// Multi-select Utils | 多选工具函数
// =============================================================================

/** Get selection rectangle from start and end points */
function getSelectionRect(start: { x: number; y: number }, end: { x: number; y: number }) {
  return {
    left: Math.min(start.x, end.x),
    top: Math.min(start.y, end.y),
    right: Math.max(start.x, end.x),
    bottom: Math.max(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  }
}

/** Check if element rect intersects with selection rect */
function rectsIntersect(
  elemRect: DOMRect,
  selRect: { left: number; top: number; right: number; bottom: number }
): boolean {
  return !(
    elemRect.right < selRect.left ||
    elemRect.left > selRect.right ||
    elemRect.bottom < selRect.top ||
    elemRect.top > selRect.bottom
  )
}

/** Check if element is too large (container-like) */
function isElementTooLarge(rect: DOMRect): boolean {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  return rect.width > viewportWidth * 0.8 && rect.height > viewportHeight * 0.5
}

/** Filter out nested elements - keep only outermost */
function filterNestedElements(elements: HTMLElement[]): HTMLElement[] {
  return elements.filter(el => {
    return !elements.some(other => other !== el && other.contains(el))
  })
}

/** Detect elements within selection rectangle */
function detectElementsInSelection(
  selRect: { left: number; top: number; right: number; bottom: number; width: number; height: number }
): Array<{ element: HTMLElement; rect: DOMRect }> {
  const results: Array<{ element: HTMLElement; rect: DOMRect }> = []

  // Query all meaningful elements
  const selector = MEANINGFUL_ELEMENTS.map(tag => tag.toLowerCase()).join(',')
  const allElements = document.querySelectorAll<HTMLElement>(selector)

  allElements.forEach(element => {
    // Skip toolbar/popup elements
    if (
      element.closest('[data-feedback-toolbar]') ||
      element.closest('[data-annotation-popup]') ||
      element.closest('[data-annotation-marker]')
    ) {
      return
    }

    const rect = element.getBoundingClientRect()

    // Skip invisible elements
    if (rect.width === 0 || rect.height === 0) return

    const style = window.getComputedStyle(element)
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return
    }

    // Skip too large elements
    if (isElementTooLarge(rect)) return

    // Check intersection
    if (rectsIntersect(rect, selRect)) {
      results.push({ element, rect })
    }
  })

  // Filter nested elements
  const filtered = filterNestedElements(results.map(r => r.element))
  return results.filter(r => filtered.includes(r.element))
}

/** Generate element description for multi-select annotation */
function generateMultiSelectDescription(elements: HTMLElement[]): string {
  if (elements.length === 0) return 'Empty area'
  if (elements.length === 1) {
    const { name } = identifyElement(elements[0])
    return name
  }

  // Count element types
  const typeCounts: Record<string, number> = {}
  elements.forEach(el => {
    const tag = el.tagName.toLowerCase()
    typeCounts[tag] = (typeCounts[tag] || 0) + 1
  })

  const parts = Object.entries(typeCounts).map(([tag, count]) => {
    return count > 1 ? `${count} ${tag}s` : tag
  })

  return `${elements.length} elements: ${parts.join(', ')}`
}

/** Calculate bounding box for multiple elements */
function calculateBoundingBox(rects: DOMRect[]): { x: number; y: number; width: number; height: number } {
  if (rects.length === 0) return { x: 0, y: 0, width: 0, height: 0 }

  const left = Math.min(...rects.map(r => r.left))
  const top = Math.min(...rects.map(r => r.top))
  const right = Math.max(...rects.map(r => r.right))
  const bottom = Math.max(...rects.map(r => r.bottom))

  return {
    x: left,
    y: top + window.scrollY,
    width: right - left,
    height: bottom - top,
  }
}

// Helper function to calculate viewport-aware tooltip positioning for markers
function getMarkerTooltipStyle(annotation: Annotation): Record<string, string> {
  const tooltipMaxWidth = 200
  const tooltipEstimatedHeight = 80
  const markerSize = 22
  const gap = 10

  // Convert percentage-based x to pixels
  const markerX = (annotation.x / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1000)
  const markerY = annotation.y

  const styles: Record<string, string> = {}

  // Vertical positioning: flip if near bottom
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const spaceBelow = viewportHeight - markerY - markerSize - gap
  if (spaceBelow < tooltipEstimatedHeight) {
    // Show above marker
    styles.top = 'auto'
    styles.bottom = `calc(100% + ${gap}px)`
  }

  // Horizontal positioning: adjust if near edges
  const centerX = markerX - tooltipMaxWidth / 2
  const edgePadding = 10
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000

  if (centerX < edgePadding) {
    // Too close to left edge
    const offset = edgePadding - centerX
    styles.left = `calc(50% + ${offset}px)`
  } else if (centerX + tooltipMaxWidth > viewportWidth - edgePadding) {
    // Too close to right edge
    const overflow = centerX + tooltipMaxWidth - (viewportWidth - edgePadding)
    styles.left = `calc(50% - ${overflow}px)`
  }

  return styles
}

function generateOutput(annots: Annotation[], path: string, level: OutputDetailLevel = 'standard'): string {
  if (annots.length === 0) return ''

  const viewport = typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : 'unknown'
  let output = `## Page Feedback: ${path}\n`

  if (level === 'forensic') {
    // Full environment info for forensic mode
    output += `\n**Environment:**\n`
    output += `- Viewport: ${viewport}\n`
    if (typeof window !== 'undefined') {
      output += `- URL: ${window.location.href}\n`
      output += `- User Agent: ${navigator.userAgent}\n`
      output += `- Timestamp: ${new Date().toISOString()}\n`
      output += `- Device Pixel Ratio: ${window.devicePixelRatio}\n`
    }
    output += `\n---\n`
  } else if (level !== 'compact') {
    output += `**Viewport:** ${viewport}\n`
  }
  output += '\n'

  annots.forEach((a, i) => {
    if (level === 'compact') {
      output += `${i + 1}. **${a.element}**: ${a.comment}`
      if (a.selectedText) {
        output += ` (re: "${a.selectedText.slice(0, 30)}${a.selectedText.length > 30 ? '...' : ''}")`
      }
      output += '\n'
    } else if (level === 'forensic') {
      // Forensic mode - order matches output page example
      output += `### ${i + 1}. ${a.element}\n`
      if (a.isMultiSelect && a.fullPath) {
        output += `*Forensic data shown for first element of selection*\n`
      }
      if (a.fullPath) {
        output += `**Full DOM Path:** ${a.fullPath}\n`
      }
      if (a.cssClasses) {
        output += `**CSS Classes:** ${a.cssClasses}\n`
      }
      if (a.boundingBox) {
        output += `**Position:** x:${Math.round(a.boundingBox.x)}, y:${Math.round(a.boundingBox.y)} (${Math.round(a.boundingBox.width)}×${Math.round(a.boundingBox.height)}px)\n`
      }
      output += `**Annotation at:** ${a.x.toFixed(1)}% from left, ${Math.round(a.y)}px from top\n`
      if (a.selectedText) {
        output += `**Selected text:** "${a.selectedText}"\n`
      }
      if (a.nearbyText && !a.selectedText) {
        output += `**Context:** ${a.nearbyText.slice(0, 100)}\n`
      }
      if (a.computedStyles) {
        output += `**Computed Styles:** ${a.computedStyles}\n`
      }
      if (a.accessibility) {
        output += `**Accessibility:** ${a.accessibility}\n`
      }
      if (a.nearbyElements) {
        output += `**Nearby Elements:** ${a.nearbyElements}\n`
      }
      output += `**Feedback:** ${a.comment}\n\n`
    } else {
      // Standard and detailed modes
      output += `### ${i + 1}. ${a.element}\n`
      output += `**Location:** ${a.elementPath}\n`

      if (level === 'detailed') {
        if (a.cssClasses) {
          output += `**Classes:** ${a.cssClasses}\n`
        }
        if (a.boundingBox) {
          output += `**Position:** ${Math.round(a.boundingBox.x)}px, ${Math.round(a.boundingBox.y)}px (${Math.round(a.boundingBox.width)}×${Math.round(a.boundingBox.height)}px)\n`
        }
      }

      if (a.selectedText) {
        output += `**Selected text:** "${a.selectedText}"\n`
      }

      if (level === 'detailed' && a.nearbyText && !a.selectedText) {
        output += `**Context:** ${a.nearbyText.slice(0, 100)}\n`
      }

      output += `**Feedback:** ${a.comment}\n\n`
    }
  })

  return output.trim()
}

// =============================================================================
// Actions
// =============================================================================

const toggleActive = () => {
  if (justFinishedToolbarDrag) return
  isActive.value = !isActive.value
}

const toggleMarkers = () => {
  if (justFinishedToolbarDrag) return
  showMarkers.value = !showMarkers.value
}

const toggleTheme = () => {
  if (justFinishedToolbarDrag) return
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('feedback-toolbar-theme', isDarkMode.value ? 'dark' : 'light')
}

const toggleSettings = () => {
  if (justFinishedToolbarDrag) return
  showSettings.value = !showSettings.value
}

const cycleOutputDetail = () => {
  const currentIndex = OUTPUT_DETAIL_OPTIONS.findIndex(
    opt => opt.value === settings.value.outputDetail
  )
  const nextIndex = (currentIndex + 1) % OUTPUT_DETAIL_OPTIONS.length
  settings.value.outputDetail = OUTPUT_DETAIL_OPTIONS[nextIndex].value
}

const setAnnotationColor = (color: string) => {
  settings.value.annotationColor = color
}

const freezeAnimations = () => {
  if (isFrozen.value) return

  const style = document.createElement('style')
  style.id = 'feedback-freeze-styles'
  style.textContent = `
    *:not([data-feedback-toolbar]):not([data-feedback-toolbar] *):not([data-annotation-popup]):not([data-annotation-popup] *):not([data-annotation-marker]):not([data-annotation-marker] *),
    *:not([data-feedback-toolbar]):not([data-feedback-toolbar] *):not([data-annotation-popup]):not([data-annotation-popup] *):not([data-annotation-marker]):not([data-annotation-marker] *)::before,
    *:not([data-feedback-toolbar]):not([data-feedback-toolbar] *):not([data-annotation-popup]):not([data-annotation-popup] *):not([data-annotation-marker]):not([data-annotation-marker] *)::after {
      animation-play-state: paused !important;
      transition: none !important;
    }
  `
  document.head.appendChild(style)

  document.querySelectorAll('video').forEach((video) => {
    if (!video.paused) {
      video.dataset.wasPaused = 'false'
      video.pause()
    }
  })

  isFrozen.value = true
}

const unfreezeAnimations = () => {
  if (!isFrozen.value) return

  const style = document.getElementById('feedback-freeze-styles')
  if (style) style.remove()

  document.querySelectorAll('video').forEach((video) => {
    if (video.dataset.wasPaused === 'false') {
      video.play()
      delete video.dataset.wasPaused
    }
  })

  isFrozen.value = false
}

const toggleFreeze = () => {
  if (justFinishedToolbarDrag) return
  if (isFrozen.value) {
    unfreezeAnimations()
    settings.value.blockInteractions = false
  } else {
    freezeAnimations()
    settings.value.blockInteractions = true
  }
}

// =============================================================================
// Toolbar Dragging
// =============================================================================

const TOOLBAR_DRAG_THRESHOLD = 5

const handleToolbarMouseDown = (e: MouseEvent) => {
  // Don't start drag from settings panel content
  if ((e.target as HTMLElement).closest('[data-settings-panel]')) {
    return
  }

  // Get toolbar's actual current position
  const toolbarEl = (e.currentTarget as HTMLElement)
  if (!toolbarEl) return

  const rect = toolbarEl.getBoundingClientRect()

  // Calculate correct wrapper position
  // When collapsed, the circle is at the right side of the 257px wrapper
  const containerWidth = 257
  const circleWidth = 44
  let currentX: number
  let currentY: number

  if (toolbarPosition.value) {
    currentX = toolbarPosition.value.x
    currentY = toolbarPosition.value.y
  } else {
    // First drag: calculate wrapper position from circle position
    if (isActive.value) {
      currentX = rect.left
    } else {
      // Collapsed: wrapper left = circle left - (containerWidth - circleWidth)
      currentX = rect.left - (containerWidth - circleWidth)
    }
    currentY = rect.top
  }

  // Generate random rotation between -5 and 5 degrees
  const randomRotation = (Math.random() - 0.5) * 10
  dragRotation.value = randomRotation

  dragStartPos.value = {
    x: e.clientX,
    y: e.clientY,
    toolbarX: currentX,
    toolbarY: currentY,
  }
}

const handleToolbarDragMove = (e: MouseEvent) => {
  if (!dragStartPos.value) return

  const deltaX = e.clientX - dragStartPos.value.x
  const deltaY = e.clientY - dragStartPos.value.y
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  // Start dragging once threshold is exceeded
  if (!isDraggingToolbar.value && distance > TOOLBAR_DRAG_THRESHOLD) {
    isDraggingToolbar.value = true
  }

  if (isDraggingToolbar.value || distance > TOOLBAR_DRAG_THRESHOLD) {
    // Calculate new position
    let newX = dragStartPos.value.toolbarX + deltaX
    let newY = dragStartPos.value.toolbarY + deltaY

    // Constrain to viewport
    const padding = 20
    const containerWidth = 257
    const circleWidth = 44
    const toolbarHeight = 44

    if (isActive.value) {
      // Expanded: constrain full container
      newX = Math.max(padding, Math.min(window.innerWidth - containerWidth - padding, newX))
    } else {
      // Collapsed: constrain circle (which is at the right side of wrapper)
      const circleOffset = containerWidth - circleWidth
      const minX = padding - circleOffset  // Allow wrapper to go negative so circle can reach left edge
      const maxX = window.innerWidth - containerWidth - padding - 16
      newX = Math.max(minX, Math.min(maxX, newX))
    }

    newY = Math.max(padding, Math.min(window.innerHeight - toolbarHeight - padding, newY))

    toolbarPosition.value = { x: newX, y: newY }
  }
}

const handleToolbarDragEnd = () => {
  if (isDraggingToolbar.value) {
    justFinishedToolbarDrag = true
    setTimeout(() => {
      justFinishedToolbarDrag = false
    }, 50)
  }
  isDraggingToolbar.value = false
  dragStartPos.value = null
}

const constrainToolbarPosition = () => {
  if (!toolbarPosition.value) return

  const padding = 20
  const containerWidth = 257
  const circleWidth = 44
  const toolbarHeight = 44

  let newX = toolbarPosition.value.x
  let newY = toolbarPosition.value.y

  if (isActive.value) {
    // Expanded: constrain full container
    newX = Math.max(padding, Math.min(window.innerWidth - containerWidth - padding, newX))
  } else {
    // Collapsed: constrain circle (which is at the right side of wrapper)
    const circleOffset = containerWidth - circleWidth
    const minX = padding - circleOffset
    const maxX = window.innerWidth - containerWidth - padding
    newX = Math.max(minX, Math.min(maxX, newX))
  }

  newY = Math.max(padding, Math.min(window.innerHeight - toolbarHeight - padding, newY))

  if (newX !== toolbarPosition.value.x || newY !== toolbarPosition.value.y) {
    toolbarPosition.value = { x: newX, y: newY }
  }
}

const handleCopy = async () => {
  if (justFinishedToolbarDrag) return
  const output = generateOutput(annotations.value, pathname.value, settings.value.outputDetail)
  if (!output) return

  if (props.copyToClipboard) {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(output)
      } else {
        // Fallback for non-secure contexts (http://localhost)
        const textArea = document.createElement('textarea')
        textArea.value = output
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        textArea.style.top = '-9999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)

      // Clear annotations after copy if setting is enabled
      if (settings.value.autoClearAfterCopy) {
        const clearedAnnotations = [...annotations.value]
        annotations.value = []
        localStorage.removeItem(getStorageKey(pathname.value))
        emit('annotationsClear', clearedAnnotations)
      }
    } catch (e) {
      console.error('Failed to copy:', e)
    }
  }

  emit('copy', output)
}

const handleClearAll = () => {
  if (justFinishedToolbarDrag) return
  if (annotations.value.length === 0) return

  const clearedAnnotations = [...annotations.value]
  annotations.value = []
  localStorage.removeItem(getStorageKey(pathname.value))

  cleared.value = true
  setTimeout(() => {
    cleared.value = false
  }, 2000)

  emit('annotationsClear', clearedAnnotations)
}

const handlePopupSubmit = (text: string) => {
  if (!pendingAnnotation.value) return

  const newAnnotation: Annotation = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    x: pendingAnnotation.value.x,
    y: pendingAnnotation.value.y,
    comment: text,
    element: pendingAnnotation.value.element,
    elementPath: pendingAnnotation.value.elementPath,
    timestamp: Date.now(),
    selectedText: pendingAnnotation.value.selectedText,
    boundingBox: pendingAnnotation.value.boundingBox,
    nearbyText: pendingAnnotation.value.nearbyText,
    cssClasses: pendingAnnotation.value.cssClasses,
    isFixed: pendingAnnotation.value.isFixed,
    fullPath: pendingAnnotation.value.fullPath,
    accessibility: pendingAnnotation.value.accessibility,
    computedStyles: pendingAnnotation.value.computedStyles,
    nearbyElements: pendingAnnotation.value.nearbyElements,
    isMultiSelect: pendingAnnotation.value.isMultiSelect,
  }

  annotations.value = [...annotations.value, newAnnotation]
  pendingAnnotation.value = null

  emit('annotationAdd', newAnnotation)
}

const handlePopupCancel = () => {
  pendingAnnotation.value = null
}

const handleEditSubmit = (text: string) => {
  if (!editingAnnotation.value) return

  const updated = { ...editingAnnotation.value, comment: text }
  annotations.value = annotations.value.map(a =>
    a.id === updated.id ? updated : a
  )
  editingAnnotation.value = null

  emit('annotationUpdate', updated)
}

const handleEditCancel = () => {
  editingAnnotation.value = null
}

const handleMarkerClick = (annotation: Annotation, e: MouseEvent) => {
  e.stopPropagation()
  editingAnnotation.value = annotation
}

const handleMarkerDelete = (annotation: Annotation, e: MouseEvent) => {
  e.stopPropagation()
  hoveredMarkerId.value = null // 重置悬停状态，恢复选中效果
  annotations.value = annotations.value.filter(a => a.id !== annotation.id)
  emit('annotationDelete', annotation)
}

// =============================================================================
// Event Handlers
// =============================================================================

// =============================================================================
// Multi-select Event Handlers | 多选事件处理
// =============================================================================

const handleSelectionMouseDown = (e: MouseEvent) => {
  // console.log('[Multi-select] mousedown triggered, isActive:', isActive.value)
  if (!isActive.value) return
  if (e.button !== 0) return // Only left click

  const target = e.target as HTMLElement
  // console.log('[Multi-select] target element:', target.tagName, target.className)

  // Skip if clicking on toolbar/popup/marker
  if (
    target.closest('[data-feedback-toolbar]') ||
    target.closest('[data-annotation-popup]') ||
    target.closest('[data-annotation-marker]')
  ) {
    // console.log('[Multi-select] skipped - toolbar/popup/marker')
    return
  }

  // Skip if there's a pending annotation
  if (pendingAnnotation.value || editingAnnotation.value) {
    // console.log('[Multi-select] skipped - pending/editing annotation')
    return
  }

  // Check if clicking on text element or contenteditable - allow native text selection
  if (TEXT_ELEMENTS.has(target.tagName) || target.isContentEditable) {
    // console.log('[Multi-select] skipped - text element:', target.tagName)
    isTextElementDrag = true
    return
  }

  // console.log('[Multi-select] mousedown accepted, recording position:', e.clientX, e.clientY)
  isTextElementDrag = false
  mouseDownPosRef.value = { x: e.clientX, y: e.clientY }
  dragSelectionStart.value = { x: e.clientX, y: e.clientY }
  dragSelectionEnd.value = { x: e.clientX, y: e.clientY }
}

const handleSelectionMouseMove = (e: MouseEvent) => {
  if (!isActive.value) return
  if (!mouseDownPosRef.value) return
  if (isTextElementDrag) return

  const dx = e.clientX - mouseDownPosRef.value.x
  const dy = e.clientY - mouseDownPosRef.value.y
  const distanceSquared = dx * dx + dy * dy

  // Check if passed drag threshold
  if (distanceSquared >= DRAG_THRESHOLD * DRAG_THRESHOLD) {
    if (!isDraggingSelection.value) {
      // console.log('[Multi-select] drag threshold passed, starting drag selection')
      isDraggingSelection.value = true
      // Clear hover state when starting drag
      hoverInfo.value = null
    }

    dragSelectionEnd.value = { x: e.clientX, y: e.clientY }
    // console.log('[Multi-select] drag update:', dragSelectionStart.value, '->', dragSelectionEnd.value)

    // Throttled element detection
    const now = Date.now()
    if (now - lastDetectionTime >= DETECTION_THROTTLE) {
      lastDetectionTime = now
      const selRect = getSelectionRect(dragSelectionStart.value!, dragSelectionEnd.value!)
      dragSelectedElements.value = detectElementsInSelection(selRect)
      // console.log('[Multi-select] detected elements:', dragSelectedElements.value.length)
    }
  }
}

const handleSelectionMouseUp = (e: MouseEvent) => {
  if (!isActive.value) return

  const wasDragging = isDraggingSelection.value

  // Reset drag state
  mouseDownPosRef.value = null
  isTextElementDrag = false

  if (!wasDragging) {
    // Not a drag - let handleClick handle it
    isDraggingSelection.value = false
    dragSelectionStart.value = null
    dragSelectionEnd.value = null
    dragSelectedElements.value = []
    return
  }

  // Complete the drag selection
  const start = dragSelectionStart.value
  const end = { x: e.clientX, y: e.clientY }

  if (start) {
    const selRect = getSelectionRect(start, end)

    // Check minimum size
    if (selRect.width >= MIN_DRAG_SIZE && selRect.height >= MIN_DRAG_SIZE) {
      // Final precise detection
      const finalElements = detectElementsInSelection(selRect)
      const elements = finalElements.map(f => f.element)
      const rects = finalElements.map(f => f.rect)

      // Calculate bounding box and Y position for annotation
      let annotationY: number
      let boundingBox: { x: number; y: number; width: number; height: number }

      if (elements.length > 0) {
        boundingBox = calculateBoundingBox(rects)
        annotationY = boundingBox.y + boundingBox.height / 2
      } else {
        // Empty area selection
        boundingBox = {
          x: selRect.left,
          y: selRect.top + window.scrollY,
          width: selRect.width,
          height: selRect.height,
        }
        annotationY = selRect.top + window.scrollY + selRect.height / 2
      }

      const description = generateMultiSelectDescription(elements)
      const elementPaths = elements.map(el => identifyElement(el).path).join('; ')

      // Create pending annotation for multi-select
      // Use mouse position for marker/popup, not bounding box center
      pendingAnnotation.value = {
        x: (e.clientX / window.innerWidth) * 100,  // Mouse X as percentage
        y: annotationY,
        clientY: e.clientY,  // Mouse Y for popup positioning
        element: description,
        elementPath: elementPaths || 'Area selection',
        boundingBox,
        isFixed: false,
        isMultiSelect: true,
      }
    }
  }

  // Reset all drag state
  isDraggingSelection.value = false
  dragSelectionStart.value = null
  dragSelectionEnd.value = null
  dragSelectedElements.value = []

  // Prevent click handler from firing after drag selection
  if (wasDragging) {
    justFinishedDragSelection = true
    setTimeout(() => {
      justFinishedDragSelection = false
    }, 50)
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isActive.value || pendingAnnotation.value || editingAnnotation.value) return

  const target = e.target as HTMLElement
  if (target.closest('[data-feedback-toolbar]')) {
    hoverInfo.value = null
    return
  }

  const elementUnder = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
  if (!elementUnder || elementUnder.closest('[data-feedback-toolbar]')) {
    hoverInfo.value = null
    return
  }

  const { name, path } = identifyElement(elementUnder)
  const rect = elementUnder.getBoundingClientRect()

  hoverInfo.value = { element: name, elementPath: path, rect }
  hoverPosition.value = { x: e.clientX, y: e.clientY }
}

const handleClick = (e: MouseEvent) => {
  if (!isActive.value) return

  // Skip if we just finished dragging the toolbar
  if (justFinishedToolbarDrag) return

  // Skip if we just finished drag selection
  if (justFinishedDragSelection) return

  const target = e.target as HTMLElement
  if (target.closest('[data-feedback-toolbar]')) return
  if (target.closest('[data-annotation-popup]')) return
  if (target.closest('[data-annotation-marker]')) return

  const isInteractive = target.closest(
    "button, a, input, select, textarea, [role='button'], [onclick]"
  )

  // Block interactions on interactive elements when enabled
  if (settings.value.blockInteractions && isInteractive) {
    e.preventDefault()
    e.stopPropagation()
    // Still create annotation on the interactive element
  }

  if (pendingAnnotation.value) {
    if (isInteractive && !settings.value.blockInteractions) {
      return
    }
    e.preventDefault()
    popupRef.value?.shake()
    return
  }

  if (editingAnnotation.value) {
    if (isInteractive && !settings.value.blockInteractions) {
      return
    }
    e.preventDefault()
    editPopupRef.value?.shake()
    return
  }

  e.preventDefault()

  const elementUnder = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
  if (!elementUnder) return

  const { name, path } = identifyElement(elementUnder)
  const rect = elementUnder.getBoundingClientRect()
  const x = (e.clientX / window.innerWidth) * 100

  const isFixed = isElementFixed(elementUnder)
  const y = isFixed ? e.clientY : e.clientY + window.scrollY

  const selection = window.getSelection()
  let selectedText: string | undefined
  if (selection && selection.toString().trim().length > 0) {
    selectedText = selection.toString().trim().slice(0, 500)
  }

  const computedStylesObj = getDetailedComputedStyles(elementUnder)
  const computedStylesStr = getForensicComputedStyles(elementUnder)

  pendingAnnotation.value = {
    x,
    y,
    clientY: e.clientY,
    element: name,
    elementPath: path,
    selectedText,
    boundingBox: {
      x: rect.left,
      y: isFixed ? rect.top : rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
    },
    nearbyText: getNearbyText(elementUnder),
    cssClasses: getElementClasses(elementUnder),
    isFixed,
    fullPath: getFullElementPath(elementUnder),
    accessibility: getAccessibilityInfo(elementUnder),
    computedStyles: computedStylesStr,
    computedStylesObj,
    nearbyElements: getNearbyElements(elementUnder),
  }
  hoverInfo.value = null
}

const handleScroll = () => {
  scrollY.value = window.scrollY
}

// Keyboard shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (pendingAnnotation.value) {
      // Let popup handle its own escape
    } else if (editingAnnotation.value) {
      // Let edit popup handle its own escape
    } else if (isActive.value) {
      isActive.value = false
    }
  }
}

// =============================================================================
// Lifecycle
// =============================================================================

onMounted(() => {
  mounted.value = true
  scrollY.value = window.scrollY

  // Load annotations
  const stored = loadAnnotations<Annotation>(pathname.value)
  annotations.value = stored

  // Entrance animation
  if (!hasPlayedEntranceAnimation) {
    showEntranceAnimation.value = true
    hasPlayedEntranceAnimation = true
    setTimeout(() => {
      showEntranceAnimation.value = false
    }, 750)
  }

  // Load theme
  try {
    const savedTheme = localStorage.getItem('feedback-toolbar-theme')
    if (savedTheme !== null) {
      isDarkMode.value = savedTheme === 'dark'
    }
  } catch (e) {
    // Ignore
  }

  // Load settings
  try {
    const storedSettings = localStorage.getItem('feedback-toolbar-settings')
    if (storedSettings) {
      settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) }
    }
  } catch (e) {
    // Ignore parsing errors
  }

  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleClick, true)
  document.addEventListener('keydown', handleKeyDown)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', constrainToolbarPosition)
  window.addEventListener('popstate', updatePathname)
  window.addEventListener('hashchange', updatePathname)

  // Listen for SPA navigation (pushState/replaceState)
  const originalPushState = history.pushState.bind(history)
  const originalReplaceState = history.replaceState.bind(history)
  history.pushState = (...args) => {
    originalPushState(...args)
    updatePathname()
  }
  history.replaceState = (...args) => {
    originalReplaceState(...args)
    updatePathname()
  }

  // Multi-select event listeners (without capture phase like React)
  document.addEventListener('mousedown', handleSelectionMouseDown)
  document.addEventListener('mousemove', handleSelectionMouseMove)
  document.addEventListener('mouseup', handleSelectionMouseUp)

  // Add cursor styles when active
  const style = document.createElement('style')
  style.id = 'feedback-cursor-styles'
  document.head.appendChild(style)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('click', handleClick, true)
  document.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', constrainToolbarPosition)
  window.removeEventListener('popstate', updatePathname)
  window.removeEventListener('hashchange', updatePathname)

  // Remove multi-select event listeners
  document.removeEventListener('mousedown', handleSelectionMouseDown)
  document.removeEventListener('mousemove', handleSelectionMouseMove)
  document.removeEventListener('mouseup', handleSelectionMouseUp)

  const style = document.getElementById('feedback-cursor-styles')
  if (style) style.remove()
})

// Watch for active state to add/remove cursor styles
watch(isActive, (active) => {
  const style = document.getElementById('feedback-cursor-styles')
  if (!style) return

  if (active) {
    style.textContent = `
      body * { cursor: crosshair !important; }
      body p, body span, body h1, body h2, body h3, body h4, body h5, body h6,
      body li, body td, body th, body label, body blockquote, body figcaption,
      body caption, body legend, body dt, body dd, body pre, body code,
      body em, body strong, body b, body i, body u, body s, body a,
      body time, body address, body cite, body q, body abbr, body dfn,
      body mark, body small, body sub, body sup, body [contenteditable],
      body p *, body span *, body h1 *, body h2 *, body h3 *, body h4 *,
      body h5 *, body h6 *, body li *, body a *, body label *, body pre *,
      body code *, body blockquote *, body [contenteditable] * {
        cursor: text !important;
      }
      [data-feedback-toolbar], [data-feedback-toolbar] * { cursor: default !important; }
      [data-annotation-marker], [data-annotation-marker] * { cursor: pointer !important; }
      [data-annotation-popup], [data-annotation-popup] * { cursor: default !important; }
      [data-annotation-popup] textarea { cursor: text !important; }
      [data-annotation-popup] button { cursor: pointer !important; }
    `
  } else {
    style.textContent = ''
    pendingAnnotation.value = null
    editingAnnotation.value = null
    hoverInfo.value = null
  }
})

// Save annotations
watch(annotations, (newAnnotations) => {
  if (mounted.value && newAnnotations.length > 0) {
    saveAnnotations(pathname.value, newAnnotations)
  } else if (mounted.value && newAnnotations.length === 0) {
    localStorage.removeItem(getStorageKey(pathname.value))
  }
}, { deep: true })

// Save settings
watch(settings, (newSettings) => {
  if (mounted.value) {
    localStorage.setItem('feedback-toolbar-settings', JSON.stringify(newSettings))
  }
}, { deep: true })

// Handle showSettings changes with exit animation
watch(showSettings, (visible) => {
  if (visible) {
    showSettingsVisible.value = true
  } else {
    setTimeout(() => {
      showSettingsVisible.value = false
    }, 150)
  }
})

// Sync blockInteractions setting with actual freeze state
watch(() => settings.value.blockInteractions, (shouldFreeze) => {
  if (shouldFreeze) {
    freezeAnimations()
  } else {
    unfreezeAnimations()
  }
})

// Reset state when deactivating
watch(isActive, (active) => {
  if (!active) {
    pendingAnnotation.value = null
    editingAnnotation.value = null
    hoverInfo.value = null
    showSettings.value = false
    if (isFrozen.value) {
      unfreezeAnimations()
      settings.value.blockInteractions = false
    }
  }
  // Constrain position when expanding/collapsing
  constrainToolbarPosition()
})

// Watch for drag start to add/remove global event listeners
watch(dragStartPos, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    // Started dragging - add global listeners
    document.addEventListener('mousemove', handleToolbarDragMove)
    document.addEventListener('mouseup', handleToolbarDragEnd)
  } else if (!newVal && oldVal) {
    // Stopped dragging - remove global listeners
    document.removeEventListener('mousemove', handleToolbarDragMove)
    document.removeEventListener('mouseup', handleToolbarDragEnd)
  }
})
</script>

<template>
  <Teleport to="body">
    <!-- Toolbar Wrapper -->
    <div
      :class="$style.toolbar"
      :style="{
        zIndex: props.zIndex,
        ...(toolbarPosition ? {
          left: `${toolbarPosition.x}px`,
          top: `${toolbarPosition.y}px`,
          right: 'auto',
          bottom: 'auto',
        } : {})
      }"
      data-feedback-toolbar
    >
      <!-- Toolbar Container -->
      <div
        :class="[
          $style.toolbarContainer,
          !isDarkMode && $style.light,
          showEntranceAnimation && $style.entrance,
          isDraggingToolbar && $style.dragging,
          isActive ? $style.expanded : $style.collapsed
        ]"
        :style="isDraggingToolbar ? { transform: `rotate(${dragRotation}deg)` } : undefined"
        @mousedown="handleToolbarMouseDown"
        @click="!isActive ? toggleActive() : undefined"
      >
        <!-- Toggle content - visible when collapsed -->
        <div :class="[$style.toggleContent, !isActive ? $style.visible : $style.hidden]">
          <component :is="IconListSparkle" :size="24" />
          <span
            v-if="hasAnnotations"
            :class="[$style.badge, isActive && $style.fadeOut, showEntranceAnimation && $style.entrance]"
            :style="{ backgroundColor: settings.annotationColor }"
          >
            {{ annotations.length }}
          </span>
        </div>

        <!-- Controls content - visible when expanded -->
        <div :class="[$style.controlsContent, isActive ? $style.visible : $style.hidden]">
          <!-- Freeze animations button -->
          <button
            :class="[$style.controlButton, !isDarkMode && $style.light]"
            :data-active="isFrozen"
            @click.stop="toggleFreeze"
            title="Pause/Resume animations"
          >
            <component :is="IconPausePlayAnimated" :size="24" :is-paused="isFrozen" />
          </button>

          <!-- Toggle markers visibility -->
          <button
            :class="[$style.controlButton, !isDarkMode && $style.light]"
            :disabled="!hasAnnotations"
            @click.stop="toggleMarkers"
            title="Toggle markers"
          >
            <component :is="IconEyeAnimated" :size="24" :is-open="showMarkers" />
          </button>

          <!-- Copy button -->
          <button
            :class="[$style.controlButton, !isDarkMode && $style.light]"
            :disabled="!hasAnnotations"
            :data-active="copied"
            @click.stop="handleCopy"
            title="Copy as markdown"
          >
            <component :is="IconCopyAnimated" :size="24" :copied="copied" />
          </button>

          <!-- Clear all button -->
          <button
            :class="[$style.controlButton, !isDarkMode && $style.light]"
            :disabled="!hasAnnotations"
            data-danger
            @click.stop="handleClearAll"
            title="Clear all annotations"
          >
            <component :is="IconTrashAlt" :size="24" />
          </button>

          <!-- Settings button -->
          <button
            :class="[$style.controlButton, !isDarkMode && $style.light]"
            @click.stop="toggleSettings"
            title="Settings"
          >
            <component :is="IconGear" :size="24" />
          </button>

          <div :class="[$style.divider, !isDarkMode && $style.light]" />

          <!-- Exit button -->
          <button
            :class="[$style.controlButton, !isDarkMode && $style.light]"
            @click.stop="toggleActive"
            title="Exit"
          >
            <component :is="IconXmarkLarge" :size="24" />
          </button>
        </div>

      <!-- Settings Panel -->
      <div
        v-if="showSettingsVisible"
        :class="[$style.settingsPanel, isDarkMode ? $style.dark : $style.light, showSettings ? $style.enter : $style.exit]"
        @click.stop
      >
        <div :class="$style.settingsHeader">
          <span :class="$style.settingsBrand">
            <span :class="$style.settingsBrandSlash" :style="{ color: settings.annotationColor }">
              /
            </span>
            agentation
          </span>
          <span :class="$style.settingsVersion">v{{ version }}</span>
          <button
            :class="$style.themeToggle"
            @click="toggleTheme"
            :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <component :is="isDarkMode ? IconSun : IconMoon" :size="14" />
          </button>
        </div>

        <div :class="$style.settingsSection">
          <div :class="$style.settingsRow">
            <div :class="[$style.settingsLabel, !isDarkMode && $style.light]">
              Output Detail
              <span :class="$style.helpIcon" data-tooltip="Controls how much detail is included in the copied output">
                <component :is="IconHelp" :size="20" />
              </span>
            </div>
            <button :class="[$style.cycleButton, !isDarkMode && $style.light]" @click="cycleOutputDetail">
              <span :class="$style.cycleButtonText">
                {{ OUTPUT_DETAIL_OPTIONS.find(opt => opt.value === settings.outputDetail)?.label }}
              </span>
              <span :class="$style.cycleDots">
                <span
                  v-for="option in OUTPUT_DETAIL_OPTIONS"
                  :key="option.value"
                  :class="[$style.cycleDot, !isDarkMode && $style.light, settings.outputDetail === option.value && $style.active]"
                />
              </span>
            </button>
          </div>
        </div>

        <div :class="$style.settingsSection">
          <div :class="[$style.settingsLabel, $style.settingsLabelMarker, !isDarkMode && $style.light]">
            Marker Colour
          </div>
          <div :class="$style.colorOptions">
            <div
              v-for="color in COLOR_OPTIONS"
              :key="color.value"
              :class="[$style.colorOptionRing, settings.annotationColor === color.value && $style.selected]"
              :style="{ borderColor: settings.annotationColor === color.value ? color.value : 'transparent' }"
              @click="setAnnotationColor(color.value)"
            >
              <div
                :class="[$style.colorOption, settings.annotationColor === color.value && $style.selected]"
                :style="{ backgroundColor: color.value }"
                :title="color.label"
              />
            </div>
          </div>
        </div>

        <div :class="$style.settingsSection">
          <label :class="$style.settingsToggle">
            <input
              type="checkbox"
              v-model="settings.autoClearAfterCopy"
            />
            <span :class="[$style.customCheckbox, !isDarkMode && $style.light, settings.autoClearAfterCopy && $style.checked]">
              <component v-if="settings.autoClearAfterCopy" :is="IconCheckSmallAnimated" :size="14" />
            </span>
            <span :class="[$style.toggleLabel, !isDarkMode && $style.light]">
              Clear after copy
            </span>
          </label>

          <label :class="$style.settingsToggle">
            <input
              type="checkbox"
              v-model="settings.blockInteractions"
            />
            <span :class="[$style.customCheckbox, !isDarkMode && $style.light, settings.blockInteractions && $style.checked]">
              <component v-if="settings.blockInteractions" :is="IconCheckSmallAnimated" :size="14" />
            </span>
            <span :class="[$style.toggleLabel, !isDarkMode && $style.light]">
              Block page interactions
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>

    <!-- Drag selection rectangle -->
    <div
      v-if="isDraggingSelection && dragSelectionStart && dragSelectionEnd"
      :class="$style.dragSelection"
      :style="{
        left: `${Math.min(dragSelectionStart.x, dragSelectionEnd.x)}px`,
        top: `${Math.min(dragSelectionStart.y, dragSelectionEnd.y)}px`,
        width: `${Math.abs(dragSelectionEnd.x - dragSelectionStart.x)}px`,
        height: `${Math.abs(dragSelectionEnd.y - dragSelectionStart.y)}px`,
      }"
    >
      <span v-if="dragSelectedElements.length > 0" :class="$style.dragCount">
        {{ dragSelectedElements.length }}
      </span>
    </div>

    <!-- Selected elements highlight during drag -->
    <div
      v-for="(item, index) in dragSelectedElements"
      :key="`drag-highlight-${index}`"
      :class="$style.selectedElementHighlight"
      :style="{
        left: `${item.rect.left}px`,
        top: `${item.rect.top}px`,
        width: `${item.rect.width}px`,
        height: `${item.rect.height}px`,
      }"
    />

    <!-- Hover highlight -->
    <div
      v-if="isActive && hoverInfo && hoverInfo.rect && !pendingAnnotation && !editingAnnotation && !hoveredMarkerId && !isDraggingSelection"
      :class="$style.hoverHighlight"
      :style="{
        left: `${hoverInfo.rect.left}px`,
        top: `${hoverInfo.rect.top}px`,
        width: `${hoverInfo.rect.width}px`,
        height: `${hoverInfo.rect.height}px`,
        borderColor: settings.annotationColor,
        backgroundColor: hexToRgba(settings.annotationColor, 0.1),
      }"
    />

    <!-- Hover tooltip -->
    <div
      v-if="isActive && hoverInfo && !pendingAnnotation && !editingAnnotation && !hoveredMarkerId && !isDraggingSelection"
      :class="[$style.hoverTooltip, !isDarkMode && $style.light]"
      :style="{
        left: `${hoverPosition.x}px`,
        top: `${hoverPosition.y + 20}px`,
      }"
    >
      {{ hoverInfo.element }}
    </div>

    <!-- Annotation markers -->
    <template v-if="isActive && showMarkers">
      <div
        v-for="(annotation, index) in annotations"
        :key="annotation.id"
        :class="[
          $style.marker,
          !isDarkMode && $style.light,
          hoveredMarkerId === annotation.id && $style.hovered,
          annotation.isMultiSelect && $style.multiSelect
        ]"
        :style="{
          left: `${annotation.x}%`,
          top: annotation.isFixed ? `${annotation.y}px` : `${annotation.y - scrollY}px`,
          position: 'fixed',
          backgroundColor: hoveredMarkerId === annotation.id ? undefined : (annotation.isMultiSelect ? '#10b981' : settings.annotationColor),
        }"
        data-annotation-marker
        @mouseenter="hoveredMarkerId = annotation.id"
        @mouseleave="hoveredMarkerId = null"
        @click="(e) => handleMarkerDelete(annotation, e)"
        @contextmenu.prevent="(e) => handleMarkerClick(annotation, e)"
      >
        <span v-if="hoveredMarkerId !== annotation.id" :class="$style.markerNumber">{{ index + 1 }}</span>
        <component v-else :is="IconXmarkLarge" :size="12" />

        <!-- Marker tooltip -->
        <div
          v-if="hoveredMarkerId === annotation.id && !editingAnnotation"
          :class="[$style.markerTooltip, !isDarkMode && $style.light, $style.enter]"
          :style="getMarkerTooltipStyle(annotation)"
        >
          <span :class="$style.markerQuote">
            {{ annotation.element }}
            <template v-if="annotation.selectedText">
              "{{ annotation.selectedText.slice(0, 30) }}{{ annotation.selectedText.length > 30 ? '...' : '' }}"
            </template>
          </span>
          <span :class="$style.markerNote">{{ annotation.comment }}</span>
        </div>
      </div>
    </template>

    <!-- Pending annotation popup -->
    <!-- Multi-select outline when pending annotation exists -->
    <div
      v-if="pendingAnnotation && pendingAnnotation.boundingBox"
      :class="pendingAnnotation.isMultiSelect ? $style.multiSelectOutline : $style.singleSelectOutline"
      :style="{
        left: `${pendingAnnotation.boundingBox.x}px`,
        top: `${pendingAnnotation.boundingBox.y - scrollY}px`,
        width: `${pendingAnnotation.boundingBox.width}px`,
        height: `${pendingAnnotation.boundingBox.height}px`,
        ...(pendingAnnotation.isMultiSelect ? {} : {
          borderColor: `${settings.annotationColor}99`,
          backgroundColor: `${settings.annotationColor}0D`,
        }),
      }"
    />
    <!-- Pending marker with plus icon -->
    <div
      v-if="pendingAnnotation"
      :class="[$style.marker, $style.pending, pendingAnnotation.isMultiSelect && $style.multiSelect]"
      :style="{
        left: `${pendingAnnotation.x}%`,
        top: `${pendingAnnotation.clientY}px`,
        backgroundColor: pendingAnnotation.isMultiSelect ? '#34C759' : settings.annotationColor,
      }"
    >
      <component :is="IconPlus" :size="12" />
    </div>
    <AnnotationPopup
      v-if="pendingAnnotation"
      ref="popupRef"
      :element="pendingAnnotation.element"
      :selected-text="pendingAnnotation.selectedText"
      :computed-styles="pendingAnnotation.computedStylesObj"
      :accent-color="pendingAnnotation.isMultiSelect ? '#34C759' : settings.annotationColor"
      :light-mode="!isDarkMode"
      :popup-style="pendingPopupStyle"
      :placeholder="pendingAnnotation.element === 'Empty area' ? 'What should change in this area?' : (pendingAnnotation.isMultiSelect ? 'Feedback for this group of elements...' : 'What should change?')"
      @submit="handlePopupSubmit"
      @cancel="handlePopupCancel"
    />

    <!-- Edit annotation popup -->
    <!-- Edit annotation outline -->
    <div
      v-if="editingAnnotation && editingAnnotation.boundingBox"
      :class="editingAnnotation.isMultiSelect ? $style.multiSelectOutline : $style.singleSelectOutline"
      :style="{
        left: `${editingAnnotation.boundingBox.x}px`,
        top: `${editingAnnotation.boundingBox.y - scrollY}px`,
        width: `${editingAnnotation.boundingBox.width}px`,
        height: `${editingAnnotation.boundingBox.height}px`,
        ...(editingAnnotation.isMultiSelect ? {} : {
          borderColor: `${settings.annotationColor}99`,
          backgroundColor: `${settings.annotationColor}0D`,
        }),
      }"
    />
    <AnnotationPopup
      v-if="editingAnnotation"
      ref="editPopupRef"
      :element="editingAnnotation.element"
      :selected-text="editingAnnotation.selectedText"
      :initial-value="editingAnnotation.comment"
      :computed-styles="editingAnnotation.computedStyles ? undefined : undefined"
      :accent-color="editingAnnotation.isMultiSelect ? '#34C759' : settings.annotationColor"
      :light-mode="!isDarkMode"
      submit-label="Save"
      :popup-style="editPopupStyle"
      @submit="handleEditSubmit"
      @cancel="handleEditCancel"
    />
  </Teleport>
</template>

<style module lang="scss">
// =============================================================================
// Animation Keyframes
// =============================================================================

@keyframes toolbarEnter {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(90deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes badgeEnter {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes markerIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

// =============================================================================
// Multi-select Styles | 多选样式
// =============================================================================

$green: #34C759;

.dragSelection {
  position: fixed;
  border: 2px solid rgba($green, 0.6);
  border-radius: 4px;
  background: rgba($green, 0.08);
  pointer-events: none;
  z-index: 99997;
  will-change: transform, width, height;
  contain: layout style;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dragCount {
  background: $green;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  min-width: 1.5rem;
  text-align: center;
}

.selectedElementHighlight {
  position: fixed;
  border: 2px solid rgba($green, 0.5);
  border-radius: 4px;
  background: rgba($green, 0.06);
  pointer-events: none;
  z-index: 99996;
  will-change: transform, width, height;
  contain: layout style;
}

.multiSelect {
  border-radius: 6px;
  width: 26px;
  height: 26px;
  margin-left: -13px;
  margin-top: -13px;
  font-size: 0.75rem;

  &.pending {
    background: $green;
  }
}

.pending {
  position: fixed;
}

.multiSelectOutline {
  position: fixed;
  border: 2px dashed rgba($green, 0.6);
  border-radius: 4px;
  pointer-events: none !important;
  background: rgba($green, 0.05);
  z-index: 99998;
  animation: hoverHighlightIn 0.15s ease-out forwards;
}

.singleSelectOutline {
  position: fixed;
  border: 2px solid;
  border-radius: 4px;
  pointer-events: none !important;
  z-index: 99998;
  animation: hoverHighlightIn 0.15s ease-out forwards;
}

@keyframes hoverHighlightIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// =============================================================================
// Toolbar
// =============================================================================

.toolbar {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 257px;
  display: flex;
  justify-content: flex-end;
  z-index: 100000;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  pointer-events: none;
}

.toolbarContainer {
  user-select: none;
  margin-left: auto;
  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #fff;
  border: none;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  cursor: grab;

  // Animated properties
  transition:
    width 0.4s cubic-bezier(0.19, 1, 0.22, 1),
    transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &.dragging {
    transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    cursor: grabbing;
  }

  &.entrance {
    animation: toolbarEnter 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
  }

  &.collapsed {
    width: 44px;
    height: 44px;
    border-radius: 22px;
    padding: 0;
    cursor: pointer;

    svg {
      margin-top: -1px;
    }

    &:hover {
      background: #2a2a2a;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &.expanded {
    width: 257px;
    height: 44px;
    border-radius: 1.5rem;
    padding: 0.375rem;
  }

  &.light {
    background: #fff;
    color: rgba(0, 0, 0, 0.85);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.08),
      0 4px 16px rgba(0, 0, 0, 0.06),
      0 0 0 1px rgba(0, 0, 0, 0.04);

    &.collapsed:hover {
      background: #f5f5f5;
    }
  }
}

.toggleContent {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.1s cubic-bezier(0.19, 1, 0.22, 1);

  &.visible {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  &.hidden {
    opacity: 0;
    pointer-events: none;
  }
}

.controlsContent {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition:
    filter 0.8s cubic-bezier(0.19, 1, 0.22, 1),
    opacity 0.8s cubic-bezier(0.19, 1, 0.22, 1),
    transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);

  &.visible {
    opacity: 1;
    filter: blur(0px);
    transform: scale(1);
    visibility: visible;
    pointer-events: auto;
  }

  &.hidden {
    opacity: 0;
    filter: blur(10px);
    transform: scale(0.4);
    pointer-events: none;
  }
}

.badge {
  position: absolute;
  top: -16px;
  right: -16px;
  user-select: none;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #3c82f7;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  opacity: 1;
  transition:
    transform 0.3s ease,
    opacity 0.2s ease;
  transform: scale(1);

  &.fadeOut {
    opacity: 0;
    transform: scale(0);
    pointer-events: none;
  }

  &.entrance {
    animation: badgeEnter 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) 0.4s both;
  }
}

.controlButton {
  position: relative;
  cursor: pointer !important;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease,
    opacity 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }

  &:active:not(:disabled) {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &[data-active="true"] {
    color: #3c82f7;
    background: rgba(60, 130, 247, 0.25);
  }

  &[data-danger]:hover:not(:disabled) {
    background: rgba(255, 59, 48, 0.25);
    color: #ff3b30;
  }

  &.light {
    color: rgba(0, 0, 0, 0.5);

    &:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.06);
      color: rgba(0, 0, 0, 0.85);
    }

    &[data-active="true"] {
      color: #3c82f7;
      background: rgba(60, 130, 247, 0.15);
    }

    &[data-danger]:hover:not(:disabled) {
      background: rgba(255, 59, 48, 0.15);
      color: #ff3b30;
    }
  }
}

.divider {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 0.125rem;

  &.light {
    background: rgba(0, 0, 0, 0.1);
  }
}

// =============================================================================
// Hover Highlight
// =============================================================================

.hoverHighlight {
  position: fixed;
  pointer-events: none;
  border: 2px dashed;
  border-radius: 4px;
  z-index: 100000;
}

.hoverTooltip {
  position: fixed;
  padding: 4px 8px;
  background: #1a1a1a;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-family: system-ui, -apple-system, sans-serif;
  pointer-events: none;
  z-index: 100000;
  white-space: nowrap;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;

  &.light {
    background: #fff;
    color: #1a1a1a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

// =============================================================================
// Markers
// =============================================================================

.marker {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: -12px;
  margin-top: -12px;
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  z-index: 99999;
  animation: markerIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: transform 0.15s ease, background-color 0.15s ease;

  &:hover {
    transform: scale(1.1);

    .markerDelete {
      opacity: 1;
    }
  }

  &.hovered {
    background: #ff3b30;
    transform: scale(1.1);
  }
}

.markerNumber {
  position: relative;
  z-index: 1;
}

.markerDelete {
  position: absolute;
  top: -6px;
  right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  background: #ff3b30;
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 2;
}

.markerTooltip {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) scale(0.909);
  z-index: 100002;
  background: #1a1a1a;
  padding: 8px 0.75rem;
  border-radius: 0.75rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 400;
  color: #fff;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.08);
  min-width: 120px;
  max-width: 200px;
  pointer-events: none;
  cursor: default;

  &.enter {
    animation: tooltipIn 0.1s ease-out forwards;
  }

  &.light {
    background: #fff;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(0, 0, 0, 0.06);

    .markerQuote {
      color: rgba(0, 0, 0, 0.5);
    }

    .markerNote {
      color: rgba(0, 0, 0, 0.85);
    }
  }
}

.markerQuote {
  display: block;
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.3125rem;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.markerNote {
  display: block;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-bottom: 2px;
}

@keyframes tooltipIn {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) scale(0.909);
  }
}

// =============================================================================
// Settings Panel
// =============================================================================

.settingsPanel {
  position: absolute;
  right: 0;
  bottom: calc(100% + 0.5rem);
  z-index: 1;
  background: #1a1a1a;
  border-radius: 1rem;
  padding: 13px 1rem 16px;
  min-width: 205px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.08);
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;

  &.enter {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0px);
    transition:
      opacity 0.2s ease,
      transform 0.2s ease,
      filter 0.2s ease;
  }

  &.exit {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
    filter: blur(5px);
    pointer-events: none;
    transition:
      opacity 0.1s ease,
      transform 0.1s ease,
      filter 0.1s ease;
  }

  &.light {
    background: #fff;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.08),
      0 4px 16px rgba(0, 0, 0, 0.06),
      0 0 0 1px rgba(0, 0, 0, 0.04);

    .settingsHeader {
      border-bottom-color: rgba(0, 0, 0, 0.08);
    }

    .settingsBrand {
      color: rgba(0, 0, 0, 0.85);
    }

    .settingsBrandSlash {
      color: rgba(0, 0, 0, 0.4);
    }

    .settingsVersion {
      color: rgba(0, 0, 0, 0.4);
    }

    .settingsSection {
      border-top-color: rgba(0, 0, 0, 0.08);
    }
  }
}

.settingsHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  margin-bottom: 0.5rem;
  padding-bottom: 9px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.settingsBrand {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.0094em;
  color: #fff;
}

.settingsBrandSlash {
  color: rgba(255, 255, 255, 0.5);
}

.settingsVersion {
  font-size: 0.6875rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  margin-left: auto;
  letter-spacing: -0.0094em;
}

.themeToggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-left: 0.5rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  .light & {
    color: rgba(0, 0, 0, 0.4);

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: rgba(0, 0, 0, 0.7);
    }
  }
}

.settingsSection {
  & + & {
    margin-top: 0.5rem;
    padding-top: calc(0.5rem + 2px);
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }
}

.settingsRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
}

.settingsLabel {
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: -0.0094em;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 0.125rem;

  &.light {
    color: rgba(0, 0, 0, 0.5);
  }
}

.settingsLabelMarker {
  margin-bottom: 10px;
}

.cycleButton {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  letter-spacing: -0.0094em;

  &.light {
    color: rgba(0, 0, 0, 0.85);
  }
}

@keyframes cycleTextIn {
  0% {
    opacity: 0;
    transform: translateY(-6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.cycleButtonText {
  display: inline-block;
  animation: cycleTextIn 0.2s ease-out;
}

.cycleDots {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cycleDot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.667);
  transition:
    background-color 0.25s ease-out,
    transform 0.25s ease-out;

  &.active {
    background: #fff;
    transform: scale(1);
  }

  &.light {
    background: rgba(0, 0, 0, 0.2);

    &.active {
      background: rgba(0, 0, 0, 0.7);
    }
  }
}

.colorOptions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.375rem;
  margin-bottom: 1px;
}

.colorOptionRing {
  display: flex;
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
  border-radius: 50%;
  transition: border-color 0.3s ease;
  cursor: pointer;

  &.selected {
    // border-color set via inline style
  }
}

.colorOption {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);

  &:hover {
    transform: scale(1.15);
  }

  &.selected {
    transform: scale(0.83);
  }
}

.settingsToggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  & + & {
    margin-top: calc(0.5rem + 6px);
  }

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
}

.customCheckbox {
  position: relative;
  width: 14px;
  height: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    background 0.25s ease,
    border-color 0.25s ease;

  svg {
    color: #1a1a1a;
    opacity: 1;
    transition: opacity 0.15s ease;
  }

  &.checked {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 1);
  }

  &.light {
    border: 1px solid rgba(0, 0, 0, 0.15);
    background: #fff;

    &.checked {
      border-color: #1a1a1a;
      background: #1a1a1a;

      svg {
        color: #fff;
      }
    }
  }
}

.toggleLabel {
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: -0.0094em;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &.light {
    color: rgba(0, 0, 0, 0.5);
  }
}

.helpIcon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  margin-left: 0;

  svg {
    display: block;
    transform: translateY(1px);
    color: rgba(255, 255, 255, 0.2);
    transition: color 0.15s ease;
  }

  &:hover svg {
    color: rgba(255, 255, 255, 0.4);
  }

  &::after {
    content: attr(data-tooltip);
    position: absolute;
    right: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
    padding: 6px 10px;
    background: #383838;
    color: rgba(255, 255, 255, 0.7);
    font-size: 11px;
    font-weight: 400;
    line-height: 14px;
    border-radius: 10px;
    width: 152px;
    text-align: left;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.15s ease,
      visibility 0.15s ease;
    pointer-events: none;
    z-index: 100;
    box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.28);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &:hover::after {
    opacity: 1;
    visibility: visible;
    transition-delay: 0.5s;
  }
}
</style>
