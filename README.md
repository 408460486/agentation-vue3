# agentation-vue3

[中文](#中文) | [English](#english)

---

## 中文

> **作者 [binyy](https://github.com/408460486)**，基于 [Benji Taylor](https://x.com/benjitaylor)、[Dennis Jin](https://x.com/seldom) 和 [Alex Vanderzon](https://x.com/alexvanderzon) 的 React 版本
>
> 原始 React 版本：[GitHub](https://github.com/benjitaylor/agentation) · [NPM](https://www.npmjs.com/package/agentation)

Agentation 是一个与 AI 工具无关的 Vue 3 可视化反馈工具。点击页面上的元素，添加注释，然后复制结构化输出，帮助 AI 编程助手找到您所指的确切代码。

### 安装

```bash
npm install agentation-vue3 -D
pnpm add agentation-vue3 -D
```

### 使用方法

```vue
<script setup>
import { Agentation } from 'agentation-vue3'
import 'agentation-vue3/dist/style.css'
</script>

<template>
  <YourApp />
  <Agentation />
</template>
```

工具栏出现在右下角。点击激活，然后点击任意元素进行标注。

### 属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `accentColor` | `string` | `'#3c82f7'` | 自定义强调色（十六进制） |
| `copyToClipboard` | `boolean` | `true` | 点击复制按钮时是否复制到剪贴板 |
| `lightMode` | `boolean` | `false` | 浅色模式样式 |
| `zIndex` | `number` | `2147483647` | 工具栏的 z-index |

### 功能特性

- **点击标注** – 点击任意元素，自动识别选择器
- **文本选择** – 选择文本以标注特定内容
- **动画暂停** – 冻结 CSS 动画以捕获特定状态
- **结构化输出** – 复制包含选择器、位置和上下文的 markdown
- **深色/浅色模式** – 匹配您的偏好或手动设置
- **可拖拽工具栏** – 将工具栏重新定位到屏幕任意位置
- **键盘快捷键** – 按 ESC 关闭工具栏
- **零依赖** – 纯 CSS 动画，无运行时库

### 工作原理

Agentation 捕获类名、选择器和元素位置，以便 AI 助手可以 `grep` 搜索您所指的确切代码。您不再需要描述"侧边栏中的蓝色按钮"，而是直接给 AI 助手提供 `.sidebar > button.primary` 和您的反馈。

### 系统要求

- Vue 3.3+
- 桌面浏览器（不支持移动端）

### 文档

完整文档请访问 [https://agentation-vue3.starpipi.eu.org/](https://agentation-vue3.starpipi.eu.org/)

---

## English

> **Made by [binyy](https://github.com/408460486)**, forked from [Benji Taylor](https://x.com/benjitaylor), [Dennis Jin](https://x.com/seldom), and [Alex Vanderzon](https://x.com/alexvanderzon)'s React version
>
> Original React Version: [GitHub](https://github.com/benjitaylor/agentation) · [NPM](https://www.npmjs.com/package/agentation)

Agentation is an agent-agnostic visual feedback tool for Vue 3. Click elements on your page, add notes, and copy structured output that helps AI coding agents find the exact code you're referring to.

### Install

```bash
npm install agentation-vue3 -D
```

### Usage

```vue
<script setup>
import { Agentation } from 'agentation-vue3'
import 'agentation-vue3/dist/style.css'
</script>

<template>
  <YourApp />
  <Agentation />
</template>
```

The toolbar appears in the bottom-right corner. Click to activate, then click any element to annotate it.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accentColor` | `string` | `'#3c82f7'` | Custom accent color (hex) |
| `copyToClipboard` | `boolean` | `true` | Whether to copy to clipboard when the copy button is clicked |
| `lightMode` | `boolean` | `false` | Light mode styling |
| `zIndex` | `number` | `2147483647` | z-index for the toolbar |

### Features

- **Click to annotate** – Click any element with automatic selector identification
- **Text selection** – Select text to annotate specific content
- **Animation pause** – Freeze CSS animations to capture specific states
- **Structured output** – Copy markdown with selectors, positions, and context
- **Dark/light mode** – Matches your preference or set manually
- **Draggable toolbar** – Reposition the toolbar anywhere on screen
- **Keyboard shortcuts** – Press ESC to close the toolbar
- **Zero dependencies** – Pure CSS animations, no runtime libraries

### How it works

Agentation captures class names, selectors, and element positions so AI agents can `grep` for the exact code you're referring to. Instead of describing "the blue button in the sidebar," you give the agent `.sidebar > button.primary` and your feedback.

### Requirements

- Vue 3.3+
- Desktop browser (mobile not supported)

### Docs

Full documentation at [https://agentation-vue3.starpipi.eu.org/](https://agentation-vue3.starpipi.eu.org/)

---

## License

© 2026 Binyy
Licensed under PolyForm Shield 1.0.0
