# agentation-vue3

Agentation is an agent-agnostic visual feedback tool for Vue 3. Click elements on your page, add notes, and copy structured output that helps AI coding agents find the exact code you're referring to.

## Install

```bash
npm install agentation-vue3 -D
```

## Usage

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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accentColor` | `string` | `'#3c82f7'` | Custom accent color (hex) |
| `copyToClipboard` | `boolean` | `true` | Whether to copy to clipboard when the copy button is clicked |
| `lightMode` | `boolean` | `false` | Light mode styling |
| `zIndex` | `number` | `2147483647` | z-index for the toolbar |

## Features

- **Click to annotate** – Click any element with automatic selector identification
- **Text selection** – Select text to annotate specific content
- **Animation pause** – Freeze CSS animations to capture specific states
- **Structured output** – Copy markdown with selectors, positions, and context
- **Dark/light mode** – Matches your preference or set manually
- **Draggable toolbar** – Reposition the toolbar anywhere on screen
- **Keyboard shortcuts** – Press ESC to close the toolbar
- **Zero dependencies** – Pure CSS animations, no runtime libraries

## How it works

Agentation captures class names, selectors, and element positions so AI agents can `grep` for the exact code you're referring to. Instead of describing "the blue button in the sidebar," you give the agent `.sidebar > button.primary` and your feedback.

## Requirements

- Vue 3.3+
- Desktop browser (mobile not supported)

## Docs

Full documentation at [agentation.dev](https://agentation.dev)

## License

© 2026 Benji Taylor
Licensed under PolyForm Shield 1.0.0
