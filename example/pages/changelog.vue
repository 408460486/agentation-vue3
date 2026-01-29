<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t, locale } = useI18n()

type ChangeType = 'added' | 'fixed' | 'improved' | 'removed'

interface Change {
  type: ChangeType
  text: string
}

interface Release {
  version: string
  date: string
  summary?: string
  changes?: Change[]
}

// Computed badge labels for i18n
const getBadgeLabel = (type: ChangeType): string => {
  const labels: Record<ChangeType, string> = {
    added: t('changelog.added'),
    fixed: t('changelog.fixed'),
    improved: t('changelog.improved'),
    removed: t('changelog.removed'),
  }
  return labels[type]
}

// Releases data synced with CHANGELOG_EN.md and CHANGELOG_CN.md
const releases = computed<Release[]>(() => {
  if (locale.value === 'zh') {
    return [
      {
        version: '1.0.3',
        date: '2025-01-29',
        changes: [
          { type: 'fixed', text: '修复 SPA 页面切换后 pathname 不更新的问题，导致 Page Feedback 显示错误路径' },
        ],
      },
      {
        version: '1.0.2',
        date: '2025-01-29',
        changes: [
          { type: 'fixed', text: '版本号现在从 package.json 动态获取' },
          { type: 'fixed', text: '输出详情模式 (compact/standard/detailed/forensic) 现在正确工作并支持设置持久化' },
          { type: 'fixed', text: '标记颜色现在正确与设置同步' },
          { type: 'fixed', text: '复制后清除功能现在正常工作' },
          { type: 'fixed', text: '阻止页面交互功能（原名冻结动画）现在正确冻结/解冻页面' },
        ],
      },
      {
        version: '1.0.1',
        date: '2025-01-28',
        changes: [
          { type: 'added', text: '添加 GitHub Actions 工作流，在发布 Release 时自动发布到 npm' },
          { type: 'added', text: '添加双语更新日志 (EN/CN)' },
          { type: 'added', text: '鼠标框选多选功能（1:1 复刻 React 版本）' },
          { type: 'improved', text: '多选框选功能增加待处理/编辑标注的视觉边框' },
          { type: 'improved', text: '降低拖拽阈值从 8px 到 5px，使选择更灵敏' },
          { type: 'improved', text: '拖拽选择时隐藏悬停高亮和提示' },
          { type: 'improved', text: '待处理标记现在在鼠标位置显示加号图标' },
          { type: 'improved', text: '多选使用绿色强调色 (#34C759) 以区分' },
          { type: 'fixed', text: '修复拖拽选择完成后触发点击事件的问题' },
          { type: 'fixed', text: '修复开发模式下 CSS 导入和别名配置' },
          { type: 'fixed', text: '改进文本元素检测以支持原生文本选择' },
        ],
      },
      {
        version: '1.0.0',
        date: '2025-01-28',
        summary: 'agentation-vue3 首次发布。AI 编程代理的可视化反馈组件。点击元素标注、文本选择、拖拽多选。多种输出详情级别、键盘快捷键、可自定义标记颜色，以及 localStorage 持久化。',
      },
    ]
  }
  // English (default)
  return [
    {
      version: '1.0.3',
      date: '2025-01-29',
      changes: [
        { type: 'fixed', text: 'Fixed pathname not updating on SPA page navigation, causing Page Feedback to show incorrect path after switching pages' },
      ],
    },
    {
      version: '1.0.2',
      date: '2025-01-29',
      changes: [
        { type: 'fixed', text: 'Version number now dynamically fetched from package.json' },
        { type: 'fixed', text: 'Output Detail mode (compact/standard/detailed/forensic) now works correctly with settings persistence' },
        { type: 'fixed', text: 'Marker colour properly syncs with settings across all components' },
        { type: 'fixed', text: 'Clear after copy functionality now works as expected' },
        { type: 'fixed', text: 'Block page interactions feature (renamed from Freeze Animations) now properly freezes/unfreezes page' },
      ],
    },
    {
      version: '1.0.1',
      date: '2025-01-28',
      changes: [
        { type: 'added', text: 'GitHub Actions workflow for automatic npm publishing on release' },
        { type: 'added', text: 'CHANGELOG with bilingual support (EN/CN)' },
        { type: 'added', text: 'Mouse drag multi-select functionality (1:1 React port)' },
        { type: 'improved', text: 'Multi-select drag selection with visual outline for pending/editing annotations' },
        { type: 'improved', text: 'Reduced drag threshold from 8px to 5px for more responsive selection' },
        { type: 'improved', text: 'Hide hover highlight and tooltip during drag selection' },
        { type: 'improved', text: 'Pending marker now displays plus icon at mouse position' },
        { type: 'improved', text: 'Multi-select uses green accent color (#34C759) for distinction' },
        { type: 'fixed', text: 'Prevent click handler from firing after drag selection completes' },
        { type: 'fixed', text: 'Fix development mode CSS import and alias configuration' },
        { type: 'fixed', text: 'Improved text element detection for native text selection' },
      ],
    },
    {
      version: '1.0.0',
      date: '2025-01-28',
      summary: 'Initial release of agentation-vue3. Visual feedback components for AI coding agents. Click elements to annotate them, select text, drag to multi-select. Multiple output detail levels, keyboard shortcuts, customizable marker colors, and localStorage persistence.',
    },
  ]
})

const changeTypes: ChangeType[] = ['fixed', 'improved', 'added', 'removed']
</script>

<template>
  <div>
    <article class="article">
      <header>
        <h1>{{ t('changelog.title') }}</h1>
        <p class="tagline">{{ t('changelog.tagline') }}</p>
      </header>

      <section v-for="release in releases" :key="release.version">
        <h2>
          <a
            :href="`https://www.npmjs.com/package/agentation-vue3/v/${release.version}`"
            target="_blank"
            rel="noopener noreferrer"
            style="color: inherit; text-decoration: none"
          >
            {{ release.version }}
          </a>
          <span style="font-weight: 400; color: rgba(0, 0, 0, 0.35); margin-left: 0">
            {{ release.date }}
          </span>
        </h2>

        <p v-if="release.summary">{{ release.summary }}</p>

        <div v-if="release.changes && release.changes.length > 0" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem">
          <template v-for="type in changeTypes" :key="type">
            <div v-if="release.changes!.filter(c => c.type === type).length > 0">
              <div style="font-size: 0.6875rem; font-weight: 500; color: rgba(0, 0, 0, 0.4); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.5rem">
                {{ getBadgeLabel(type) }}
              </div>
              <ul>
                <li v-for="(change, j) in release.changes!.filter(c => c.type === type)" :key="j">
                  <template v-if="change.link">
                    <NuxtLink :to="change.link.href" class="styled-link">{{ change.link.label }}</NuxtLink>: {{ change.text }}
                  </template>
                  <template v-else>
                    {{ change.text }}
                  </template>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </section>
    </article>

    <Footer />
  </div>
</template>
