// =============================================================================
// Utils Entry Point
// =============================================================================

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
} from "./element-identification";

export {
  loadAnnotations,
  saveAnnotations,
  getStorageKey,
  clearAnnotations,
} from "./storage";
