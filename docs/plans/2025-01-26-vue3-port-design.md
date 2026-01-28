# Agentation Vue 3 移植设计文档

## 概述

将 React 版本的 Agentation 完全等价移植到 Vue 3，保持 1:1 的功能、API 和行为。

## 技术选型

| 决策点 | 选择 |
|--------|------|
| 组件 API | Composition API + `<script setup>` |
| 构建工具 | Vite + @vitejs/plugin-vue |
| 样式方案 | Vue SFC Scoped Styles (`<style scoped lang="scss">`) |
| 文档网站 | Nuxt 3 |
| 包名 | `agentation-vue3` |

## 项目结构

```
agentation-main-vue3/
├── src/                          # 包源码
│   ├── index.ts                  # 入口，导出所有公共 API
│   ├── types.ts                  # 共享类型定义（直接复用 React 版本）
│   ├── components/
│   │   ├── Agentation.vue        # 主组件 (对应 PageFeedbackToolbarCSS)
│   │   ├── AnnotationPopup.vue   # 弹窗组件
│   │   └── icons.ts              # SVG 图标（纯函数，可直接复用）
│   └── utils/                    # 工具函数（纯 TS，直接复用 React 版本）
│       ├── element-identification.ts
│       ├── storage.ts
│       └── source-location.ts
├── example/                      # Nuxt 3 文档/演示站点
│   ├── nuxt.config.ts
│   ├── app.vue
│   └── pages/
├── package.json
├── vite.config.ts                # 库模式构建配置
├── tsconfig.json
└── CLAUDE.md
```

## API 映射

### Props 与 Events

React 版本的回调 Props 转换为 Vue 3 的 emits：

```typescript
// Vue 3 - defineEmits
const emit = defineEmits<{
  annotationAdd: [annotation: Annotation]
  annotationDelete: [annotation: Annotation]
  annotationUpdate: [annotation: Annotation]
  annotationsClear: [annotations: Annotation[]]
  copy: [markdown: string]
}>()
```

### 使用方式对比

| React 版本 | Vue 3 版本 |
|-----------|-----------|
| `<Agentation onAnnotationAdd={fn} />` | `<Agentation @annotation-add="fn" />` |
| `<Agentation onCopy={fn} />` | `<Agentation @copy="fn" />` |
| `<Agentation copyToClipboard={false} />` | `<Agentation :copy-to-clipboard="false" />` |

### Ref 暴露 (对应 React useImperativeHandle)

```typescript
// Vue 3 - defineExpose
defineExpose({
  shake: () => { /* 震动动画 */ }
})
```

## React → Vue 3 映射规则

### 状态管理

```typescript
// React                              // Vue 3
useState(false)                  →    ref(false)
useState<Type | null>(null)      →    ref<Type | null>(null)
useRef<HTMLElement>(null)        →    ref<HTMLElement | null>(null)
useCallback(fn, [deps])          →    直接定义函数（或用 computed 如需缓存）
```

### 生命周期

```typescript
// React                              // Vue 3
useEffect(() => {}, [])          →    onMounted(() => {})
useEffect(() => { return cleanup })  → onMounted + onUnmounted
useEffect(() => {}, [dep])       →    watch(dep, () => {})
```

### Portal 渲染

```typescript
// React                              // Vue 3
createPortal(jsx, document.body) →    <Teleport to="body">...</Teleport>
```

## 构建配置

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AgentationVue3',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' }
      }
    }
  }
})
```

### package.json

```json
{
  "name": "agentation-vue3",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && vue-tsc --emitDeclarationOnly",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## 实现计划

### 文件清单

| 文件 | 来源 | 工作量 |
|------|------|--------|
| `src/types.ts` | 直接复制 React 版本 | 无 |
| `src/utils/element-identification.ts` | 直接复制 | 无 |
| `src/utils/storage.ts` | 直接复制 | 无 |
| `src/utils/source-location.ts` | 直接复制 | 无 |
| `src/components/icons.ts` | 直接复制 | 无 |
| `src/components/Agentation.vue` | 从 React 转换 | 高 |
| `src/components/AnnotationPopup.vue` | 从 React 转换 | 中 |
| `src/index.ts` | 重写导出 | 低 |
| `vite.config.ts` | 新建 | 低 |
| `tsconfig.json` | 新建 | 低 |
| `package.json` | 新建 | 低 |
| `CLAUDE.md` | 新建 | 低 |
| `example/` (Nuxt 3) | 参考 React 版本重建 | 中 |

### 实现顺序

1. **基础设施** - package.json, vite.config.ts, tsconfig.json
2. **复制可复用代码** - types, utils, icons
3. **核心组件转换** - AnnotationPopup.vue（较简单，先做）
4. **主组件转换** - Agentation.vue（最复杂）
5. **入口文件** - index.ts 导出
6. **验证构建** - `pnpm build` 确保编译通过
7. **示例应用** - Nuxt 3 example 站点
8. **测试** - 功能验证

## 版本策略

- 独立版本号，从 `1.0.0` 开始
- Changelog 中注明对应的 React 版本（如"对应 React 版本 1.3.2"）

## 备注

- 未来还将有 `agentation-vue2` 版本（独立项目 `agentation/vue2`）
- 所有工具函数（utils/）为纯 TypeScript，可跨版本共享
