<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t, locale } = useI18n()

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  title: string
  items: FAQItem[]
}

const faqCategories = computed<FAQCategory[]>(() => {
  if (locale.value === 'zh') {
    return [
      {
        title: 'faq.basics',
        items: [
          {
            question: '什么是 Agentation？',
            answer: 'Agentation 是一个浮动工具栏，可让您在网页上添加标注并为 AI 编程助手生成结构化反馈。点击元素、选择文本，然后复制 AI 助手可以解析的 markdown，以找到并修复代码库中的问题。<br><br>它源于 <a href="https://benji.org/annotating" target="_blank" rel="noopener noreferrer" class="faq-link">Benji Taylor 的一篇文章</a>，探讨如何向 AI 助手提供更好的反馈，现已打包供所有人使用。',
          },
          {
            question: '为什么不直接截图标注？',
            answer: '截图会丢失与代码的连接。当您标注截图时，AI 必须猜测"蓝色按钮"指的是哪个组件。Agentation 为 AI 助手提供实际的选择器，如 <code>.sidebar > button.primary</code>，它们可以在您的代码库中使用 <code>grep</code> 搜索。这就是"修复这个"和"修复 <code>src/components/Button.vue:42</code> 这里"的区别。',
          },
          {
            question: '如何安装？',
            answer: '通过 npm 安装：<code>npm install agentation-vue3</code>，然后导入并将 <code>&lt;Agentation /&gt;</code> 组件添加到您的应用中。支持 Vue 3.3+ 和 Nuxt 3。',
          },
        ],
      },
      {
        title: 'faq.usage',
        items: [
          {
            question: '元素识别如何工作？',
            answer: 'Agentation 使用类名、ID、文本内容和语义结构自动识别元素。按钮以其文本命名，标题以内容命名，图片以 <code>alt</code> 文本命名。这使 AI 助手可以轻松地在您的代码库中使用 <code>grep</code> 搜索元素。',
          },
          {
            question: '可以标注文本选择吗？',
            answer: '可以。选择页面上的任何文本来标注特定内容。选中的文本会在输出中被引用，使 AI 助手可以轻松搜索代码中的精确字符串。',
          },
          {
            question: '如何折叠工具栏？',
            answer: '点击 X 图标或按 <code>Escape</code> 键折叠工具栏。它会保持最小化直到您再次需要它。',
          },
          {
            question: '可以暂停动画吗？',
            answer: '可以。点击暂停图标冻结 CSS 动画和过渡。注意，JavaScript 驱动的动画（如 GSAP 或自定义动画）不会受到影响。',
          },
          {
            question: '可以自定义标记颜色吗？',
            answer: '可以。点击设置图标从预设颜色中选择标注标记的颜色。您的偏好会保存在 <code>localStorage</code> 中。',
          },
          {
            question: '标注存储在哪里？',
            answer: '标注存储在 <code>localStorage</code> 中，以页面路径为键。它们在页面刷新后仍然存在，但会在 7 天后或点击"清除所有"时被清除。',
          },
        ],
      },
      {
        title: 'faq.outputSection',
        items: [
          {
            question: '有哪些输出格式？',
            answer: '四种格式：<code>简洁</code>（最少上下文）、<code>标准</code>（平衡）、<code>详细</code>（完整上下文，包含边界框）和 <code>取证</code>（最大详细程度，包括计算样式）。根据您的 AI 助手需要多少上下文来选择。',
          },
          {
            question: '哪些 AI 助手可以使用 Agentation？',
            answer: '任何接受文本输入的 AI 编程助手。markdown 输出与 AI 工具无关，可与 Claude、GPT-4、Cursor、Copilot 等配合使用。只需将复制的输出粘贴到您的 AI 助手的聊天中。',
          },
          {
            question: '多人可以共享标注吗？',
            answer: '标注存储在每个用户的浏览器本地，因此不会自动共享。要协作，请直接复制和共享 markdown 输出。',
          },
        ],
      },
      {
        title: 'faq.technical',
        items: [
          {
            question: '有 Vue 依赖吗？',
            answer: '是的，Agentation Vue 3 需要 Vue 3.3+ 作为同级依赖。它作为 Vue 组件构建，可与现代 Vue 应用程序无缝集成。',
          },
          {
            question: '支持 TypeScript 吗？',
            answer: '是的。Agentation 使用 TypeScript 编写并导出完整的类型定义。像 <code>demoAnnotations</code> 这样的属性和配置选项都有完整的类型。',
          },
          {
            question: '支持 SSR/SSG 吗？',
            answer: '是的，但仅在客户端。在 Nuxt 配置中设置 <code>ssr: false</code> 或使用 <code>ClientOnly</code> 包装器。它可与 Nuxt 3 和其他 SSR/SSG 框架配合使用。',
          },
          {
            question: '会影响性能吗？',
            answer: '影响最小。Agentation 仅添加事件监听器并渲染一个小工具栏。它不会修改您现有的 DOM 或拦截网络请求。标注标记是轻量级的 SVG 覆盖层。',
          },
          {
            question: '应该在生产环境中使用吗？',
            answer: '可以，但它被设计为开发工具。我们建议仅在开发环境中条件渲染它，或在功能标志后面使用。工具栏在激活之前对用户不可见。',
          },
          {
            question: '可以标注 iframe 或 shadow DOM 吗？',
            answer: '目前，Agentation 只能标注主文档中的元素。由于浏览器安全限制，iframe 和 shadow DOM 内容不可访问。',
          },
          {
            question: '如何报告错误或请求功能？',
            answer: '在 <a href="https://github.com/benjitaylor/agentation/issues" target="_blank" rel="noopener noreferrer" class="faq-link">GitHub</a> 上提交 issue。也欢迎提交 Pull Request。',
          },
        ],
      },
    ]
  }
  // English (default)
  return [
    {
      title: 'faq.basics',
      items: [
        {
          question: 'What is Agentation?',
          answer: 'Agentation is a floating toolbar that lets you annotate web pages and generate structured feedback for AI coding agents. Click elements, select text, and copy markdown that agents can parse to find and fix issues in your codebase.<br><br>It grew out of <a href="https://benji.org/annotating" target="_blank" rel="noopener noreferrer" class="faq-link">a post by Benji Taylor</a> exploring how to give better feedback to AI agents, and has since been packaged for anyone to use.',
        },
        {
          question: 'Why not just screenshot and annotate?',
          answer: 'Screenshots lose the connection to code. When you annotate a screenshot, the AI has to guess which component you mean by "the blue button." Agentation gives agents actual selectors like <code>.sidebar > button.primary</code> that they can <code>grep</code> for in your codebase. It\'s the difference between "fix this" and "fix this at <code>src/components/Button.vue:42</code>."',
        },
        {
          question: 'How do I install it?',
          answer: 'Install via npm with <code>npm install agentation-vue3</code>, then import and add the <code>&lt;Agentation /&gt;</code> component to your app. Works with Vue 3.3+ and Nuxt 3.',
        },
      ],
    },
    {
      title: 'faq.usage',
      items: [
        {
          question: 'How does element identification work?',
          answer: 'Agentation automatically identifies elements using class names, IDs, text content, and semantic structure. Buttons are named by their text, headings by content, images by <code>alt</code> text. This makes it easy for agents to <code>grep</code> for elements in your codebase.',
        },
        {
          question: 'Can I annotate text selections?',
          answer: 'Yes. Select any text on the page to annotate specific content. The selected text is quoted in the output, making it easy for agents to search for exact strings in your code.',
        },
        {
          question: 'How do I collapse the toolbar?',
          answer: 'Click the X icon or press <code>Escape</code> to collapse the toolbar. It stays minimal until you need it again.',
        },
        {
          question: 'Can I pause animations?',
          answer: 'Yes. Click the pause icon to freeze CSS animations and transitions. Note that JavaScript-driven animations (like GSAP or custom animations) won\'t be affected.',
        },
        {
          question: 'Can I customize marker colors?',
          answer: 'Yes. Click the settings icon to choose from preset colors for annotation markers. Your preference is saved in <code>localStorage</code>.',
        },
        {
          question: 'Where are annotations stored?',
          answer: 'Annotations are stored in <code>localStorage</code>, keyed by page pathname. They persist across page refreshes but are cleared after 7 days or when you click "Clear all".',
        },
      ],
    },
    {
      title: 'faq.outputSection',
      items: [
        {
          question: 'What output formats are available?',
          answer: 'Four formats: <code>Compact</code> (minimal context), <code>Standard</code> (balanced), <code>Detailed</code> (full context with bounding boxes), and <code>Forensic</code> (maximum detail including computed styles). Choose based on how much context your AI agent needs.',
        },
        {
          question: 'Which AI agents work with Agentation?',
          answer: 'Any AI coding agent that accepts text input. The markdown output is agent-agnostic and works with Claude, GPT-4, Cursor, Copilot, and others. Just paste the copied output into your agent\'s chat.',
        },
        {
          question: 'Can multiple people share annotations?',
          answer: 'Annotations are stored locally in each user\'s browser, so they\'re not shared automatically. For collaboration, copy and share the markdown output directly.',
        },
      ],
    },
    {
      title: 'faq.technical',
      items: [
        {
          question: 'Is there a Vue dependency?',
          answer: 'Yes, Agentation Vue 3 requires Vue 3.3+ as a peer dependency. It\'s built as a Vue component to integrate seamlessly with modern Vue applications.',
        },
        {
          question: 'Does it work with TypeScript?',
          answer: 'Yes. Agentation is written in TypeScript and exports full type definitions. Props like <code>demoAnnotations</code> and configuration options are fully typed.',
        },
        {
          question: 'Does it work with SSR/SSG?',
          answer: 'Yes, but only on the client side. Set <code>ssr: false</code> in your Nuxt config or use <code>ClientOnly</code> wrapper. It works with Nuxt 3 and other SSR/SSG frameworks.',
        },
        {
          question: 'Does it affect performance?',
          answer: 'Minimal impact. Agentation only adds event listeners and renders a small toolbar. It doesn\'t modify your existing DOM or intercept network requests. The annotation markers are lightweight SVG overlays.',
        },
        {
          question: 'Should I include it in production?',
          answer: 'You can, but it\'s designed as a development tool. We recommend conditionally rendering it only in development or behind a feature flag. The toolbar is invisible to users until activated.',
        },
        {
          question: 'Can I annotate iframes or shadow DOM?',
          answer: 'Currently, Agentation only annotates elements in the main document. Iframes and shadow DOM content are not accessible due to browser security restrictions.',
        },
        {
          question: 'How do I report bugs or request features?',
          answer: 'Open an issue on <a href="https://github.com/benjitaylor/agentation/issues" target="_blank" rel="noopener noreferrer" class="faq-link">GitHub</a>. Pull requests are welcome too.',
        },
      ],
    },
  ]
})

const openKey = ref<string | null>(null)

const handleToggle = (key: string) => {
  openKey.value = openKey.value === key ? null : key
}
</script>

<template>
  <div>
    <article class="article">
      <header>
        <h1>{{ t('faq.title') }}</h1>
        <p class="tagline">{{ t('faq.tagline') }}</p>
      </header>

      <div v-for="(category, catIndex) in faqCategories" :key="catIndex" class="faq-category">
        <h2>{{ t(category.title) }}</h2>
        <div
          v-for="(faq, itemIndex) in category.items"
          :key="`${catIndex}-${itemIndex}`"
          class="faq-item"
        >
          <button
            class="faq-question"
            @click="handleToggle(`${catIndex}-${itemIndex}`)"
            :aria-expanded="openKey === `${catIndex}-${itemIndex}`"
          >
            <span>{{ faq.question }}</span>
            <span :class="['faq-icon', { open: openKey === `${catIndex}-${itemIndex}` }]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </button>
          <div :class="['faq-answer', { open: openKey === `${catIndex}-${itemIndex}` }]">
            <div class="faq-answer-inner">
              <p v-html="faq.answer" />
            </div>
          </div>
        </div>
      </div>
    </article>

    <Footer />
  </div>
</template>

<style scoped>
.faq-category {
  margin-top: 0.5rem;
}
.faq-category + .faq-category {
  margin-top: 1.5rem;
}
.faq-category h2 {
  margin-bottom: 0.25rem;
}
.faq-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.faq-item:last-child {
  border-bottom: none;
}
.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 0;
  font-size: 0.75rem;
  font-weight: 450;
  color: rgba(0, 0, 0, 0.55);
  text-align: left;
  cursor: pointer;
  transition: color 0.15s ease;
}
.faq-question:hover {
  color: rgba(0, 0, 0, 0.8);
}
.faq-icon {
  flex-shrink: 0;
  color: rgba(0, 0, 0, 0.3);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease;
}
.faq-icon.open {
  transform: rotate(180deg);
  color: rgba(0, 0, 0, 0.5);
}
.faq-answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.faq-answer.open {
  grid-template-rows: 1fr;
}
.faq-answer-inner {
  overflow: hidden;
}
.faq-answer-inner p {
  padding-bottom: 1rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.55);
}
.faq-answer-inner code {
  font-family: "SF Mono", "SFMono-Regular", ui-monospace, Consolas, monospace;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.04);
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  color: rgba(0, 0, 0, 0.65);
}
.faq-link {
  color: #2480ed;
  text-decoration: none;
  transition: color 0.15s ease;
}
.faq-link:hover {
  color: #74b1fd;
}
</style>
