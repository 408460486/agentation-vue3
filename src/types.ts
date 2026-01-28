// =============================================================================
// Shared Types | 共享类型定义
// =============================================================================
//
// This file contains all TypeScript type definitions used across the Agentation
// library. The main type is `Annotation` which represents a single user annotation
// on a web page element.
//
// 此文件包含 Agentation 库中使用的所有 TypeScript 类型定义。
// 主要类型是 `Annotation`，表示用户在网页元素上的单个标注。
//
// =============================================================================

/**
 * Annotation Type | 标注类型
 *
 * Represents a single annotation created by the user on a web page element.
 * Contains all metadata needed to identify, locate, and describe the annotated element.
 *
 * 表示用户在网页元素上创建的单个标注。
 * 包含识别、定位和描述被标注元素所需的所有元数据。
 */
export type Annotation = {
  /** Unique identifier for the annotation | 标注的唯一标识符 */
  id: string;

  /** X position as percentage of viewport width | X 位置（视口宽度的百分比） */
  x: number;

  /**
   * Y position in pixels from top of document (absolute positioning)
   * OR from viewport top (if isFixed is true)
   * Y 位置（从文档顶部的像素值，或如果 isFixed 为 true 则从视口顶部）
   */
  y: number;

  /** User's comment/feedback text | 用户的评论/反馈文本 */
  comment: string;

  /** Human-readable element name (e.g., "button 'Submit'") | 人类可读的元素名称 */
  element: string;

  /** CSS selector path to the element (e.g., ".form > button.primary") | 元素的 CSS 选择器路径 */
  elementPath: string;

  /** Unix timestamp when annotation was created | 创建标注时的 Unix 时间戳 */
  timestamp: number;

  /** Selected text content if user selected text | 用户选中的文本内容（如果有） */
  selectedText?: string;

  /**
   * Element's bounding box coordinates and dimensions
   * 元素的边界框坐标和尺寸
   */
  boundingBox?: {
    x: number;      // Left position | 左侧位置
    y: number;      // Top position | 顶部位置
    width: number;  // Element width | 元素宽度
    height: number; // Element height | 元素高度
  };

  /** Text content from element and nearby siblings | 元素及其相邻兄弟元素的文本内容 */
  nearbyText?: string;

  /** CSS class names (cleaned of module hashes) | CSS 类名（已清理模块哈希） */
  cssClasses?: string;

  /** Identifiers of nearby sibling elements | 相邻兄弟元素的标识符 */
  nearbyElements?: string;

  /** Computed CSS styles snapshot | 计算后的 CSS 样式快照 */
  computedStyles?: string;

  /** Full DOM ancestry path (for forensic mode) | 完整的 DOM 祖先路径（用于取证模式） */
  fullPath?: string;

  /** Accessibility attributes (role, aria-label, etc.) | 无障碍属性 */
  accessibility?: string;

  /** True if created via drag selection (multi-select mode) | 是否通过拖拽选择创建 */
  isMultiSelect?: boolean;

  /** True if element has fixed/sticky positioning | 元素是否具有固定/粘性定位 */
  isFixed?: boolean;
};
