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

## Release Workflow / 发布流程

### Prerequisites / 前置条件
1. 确保已安装 GitHub CLI (`gh`)
2. 确保已登录 GitHub CLI: `gh auth login`
3. 确保 GitHub 仓库已配置 `NPM_TOKEN` secret (Settings → Secrets → Actions)

### Release Steps / 发布步骤

#### 1. Update library version / 更新库版本号
```bash
cd vue3  # 进入库项目目录

# 更新 package.json 版本号 (选择其一)
npm version patch  # 1.0.0 → 1.0.1 (bug fixes / 修复问题)
npm version minor  # 1.0.0 → 1.1.0 (new features / 新功能)
npm version major  # 1.0.0 → 2.0.0 (breaking changes / 破坏性变更)

# 或手动编辑 package.json 中的 "version" 字段
```

#### 2. Update changelog / 更新日志
```bash
# 编辑 CHANGELOG_EN.md 和 CHANGELOG_CN.md，将 [Unreleased] 内容移到新版本下
# 格式: ## [x.y.z] - YYYY-MM-DD
```

#### 2.1 Sync changelog page / 同步更新日志页面
```bash
# 编辑 example/pages/changelog.vue
# 将新版本的变更内容添加到 releases computed 属性中
# 需要同时更新中文和英文两个版本的内容，与 CHANGELOG 文件保持一致
# 文件位置: vue3/example/pages/changelog.vue
```

#### 3. Regenerate example lockfile / 重新生成示例项目锁文件
```bash
cd vue3/example
rm -f pnpm-lock.yaml
pnpm install
cd ..
```

#### 4. Commit and push / 提交并推送
```bash
git add package.json CHANGELOG_EN.md CHANGELOG_CN.md example/pnpm-lock.yaml
git commit -m "chore: release vx.y.z"
git push
```

#### 5. Create GitHub Release / 创建 GitHub Release
```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes "Release notes here"
```

#### 6. Automatic npm publish / 自动发布到 npm
- GitHub Actions 会自动触发 `Publish to npm` 工作流
- 工作流会构建项目并发布到 npm
- 可通过以下命令查看状态:
```bash
gh run list --limit 3
```

### Version Sync / 版本同步
- Release tag 格式: `vX.Y.Z` (如 `v1.0.1`)
- npm 版本: `X.Y.Z` (如 `1.0.1`)
- GitHub Actions 会自动处理版本匹配

### Verify Release / 验证发布
```bash
# 查看 npm 包信息
npm view agentation-vue3

# 查看 GitHub Release
gh release view vX.Y.Z
```
