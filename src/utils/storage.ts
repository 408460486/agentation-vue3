// =============================================================================
// Storage Utilities | 存储工具函数
// =============================================================================
//
// Handles persistence of annotations to localStorage with automatic expiration.
// Annotations are stored per-page (keyed by pathname) and expire after 7 days.
//
// 处理标注到 localStorage 的持久化存储，支持自动过期。
// 标注按页面存储（以路径名为键），7 天后自动过期。
//
// TODO: Abstract this to accept a StorageAdapter interface for custom storage
// (IndexedDB, API backend, etc.)
// TODO: 抽象为 StorageAdapter 接口以支持自定义存储（IndexedDB、API 后端等）
//
// =============================================================================

import type { Annotation } from "../types";

/** Storage key prefix for all annotations | 所有标注的存储键前缀 */
const STORAGE_PREFIX = "feedback-annotations-";

/** Default retention period in days | 默认保留天数 */
const DEFAULT_RETENTION_DAYS = 7;

/**
 * Generates a storage key for a given pathname.
 * 根据给定路径名生成存储键。
 *
 * @param pathname - The page pathname (e.g., "/dashboard") | 页面路径名
 * @returns The full storage key | 完整的存储键
 */
export function getStorageKey(pathname: string): string {
  return `${STORAGE_PREFIX}${pathname}`;
}

/**
 * Loads annotations from localStorage for a given page.
 * Automatically filters out annotations older than the retention period.
 *
 * 从 localStorage 加载指定页面的标注。
 * 自动过滤掉超过保留期的旧标注。
 *
 * @param pathname - The page pathname | 页面路径名
 * @returns Array of annotations (empty if none found or on error) | 标注数组
 */
export function loadAnnotations<T = Annotation>(pathname: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(getStorageKey(pathname));
    if (!stored) return [];
    const data = JSON.parse(stored);
    // Filter out expired annotations | 过滤掉过期的标注
    const cutoff = Date.now() - DEFAULT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    return data.filter((a: { timestamp?: number }) => !a.timestamp || a.timestamp > cutoff);
  } catch {
    return [];
  }
}

/**
 * Saves annotations to localStorage for a given page.
 * Silently fails if localStorage is full or disabled.
 *
 * 将标注保存到 localStorage。
 * 如果 localStorage 已满或被禁用，则静默失败。
 *
 * @param pathname - The page pathname | 页面路径名
 * @param annotations - Array of annotations to save | 要保存的标注数组
 */
export function saveAnnotations<T = Annotation>(pathname: string, annotations: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(pathname), JSON.stringify(annotations));
  } catch {
    // localStorage might be full or disabled | localStorage 可能已满或被禁用
  }
}

/**
 * Clears all annotations for a given page from localStorage.
 * 从 localStorage 清除指定页面的所有标注。
 *
 * @param pathname - The page pathname | 页面路径名
 */
export function clearAnnotations(pathname: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getStorageKey(pathname));
  } catch {
    // ignore | 忽略错误
  }
}
