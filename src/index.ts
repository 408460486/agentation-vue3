// =============================================================================
// Agentation Vue 3
// =============================================================================
//
// A floating toolbar for annotating web pages and collecting structured feedback
// for AI coding agents.
//
// Usage:
//   import { Agentation } from 'agentation-vue3'
//   <Agentation />
//
// =============================================================================

// Main component
export { default as Agentation } from './components/Agentation.vue'
export { default as AgentationVue } from './components/Agentation.vue' // Alias

// Shared components
export { default as AnnotationPopup } from './components/AnnotationPopup.vue'

// Icons
export * from './components/icons'

// Utilities
export {
  identifyElement,
  identifyAnimationElement,
  getElementPath,
  getNearbyText,
  getElementClasses,
  getNearbyElements,
  getComputedStylesSnapshot,
  getDetailedComputedStyles,
  getForensicComputedStyles,
  parseComputedStylesString,
  getAccessibilityInfo,
  getFullElementPath,
} from './utils/element-identification'

export {
  loadAnnotations,
  saveAnnotations,
  getStorageKey,
  clearAnnotations,
} from './utils/storage'

// Types
export type { Annotation } from './types'
export type { AgentationProps } from './components/Agentation.vue'
export type { AnnotationPopupProps, AnnotationPopupExpose } from './components/AnnotationPopup.vue'
