# Agentation Vue 3

Vue 3 version of Agentation - Visual feedback for AI coding agents.

## Project Structure

```
vue3/
├── src/
│   ├── index.ts                    # Entry point, exports all public APIs
│   ├── types.ts                    # Shared type definitions
│   ├── components/
│   │   ├── Agentation.vue          # Main toolbar component
│   │   ├── AnnotationPopup.vue     # Annotation popup component
│   │   └── icons.ts                # SVG icon components
│   └── utils/
│       ├── index.ts                # Utils entry
│       ├── element-identification.ts  # DOM element identification
│       ├── storage.ts              # LocalStorage utilities
│       └── source-location.ts      # Vue component source location
├── example/                        # Nuxt 3 demo site
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Key Conventions

### Component API
- Use Composition API with `<script setup>`
- Use `defineProps<Props>()` for typed props
- Use `defineEmits<Emits>()` for typed events
- Use `defineExpose()` for exposing methods to parent

### React to Vue 3 Mapping
- `useState()` → `ref()`
- `useEffect(() => {}, [])` → `onMounted()`
- `useEffect(() => { return cleanup }, [])` → `onMounted()` + `onUnmounted()`
- `useEffect(() => {}, [dep])` → `watch(dep, () => {})`
- `createPortal()` → `<Teleport>`
- `useImperativeHandle()` → `defineExpose()`
- `forwardRef` → not needed

### Styling
- Use `<style module lang="scss">` for CSS Modules
- Access classes via `$style.className`
- All styles are scoped by default

## Commands

```bash
pnpm install     # Install dependencies
pnpm dev         # Build in watch mode
pnpm build       # Production build
pnpm test        # Run tests
```

## Ported from React version 1.3.2
