<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  code: string
  language?: string
}>()

const highlightedCode = ref('')

// Simple syntax highlighting for TypeScript/JavaScript
const highlight = (code: string, lang: string = 'typescript') => {
  let result = escapeHtml(code)

  // Keywords
  const keywords = ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'new', 'this', 'type', 'interface', 'async', 'await', 'default', 'typeof', 'void', 'null', 'undefined', 'true', 'false']

  // Types
  const types = ['string', 'number', 'boolean', 'void', 'any', 'never', 'unknown', 'object', 'Array', 'Promise', 'Annotation', 'AgentationProps']

  // Comments (single line)
  result = result.replace(/(\/\/[^\n]*)/g, '<span class="cb-comment">$1</span>')

  // Strings (double quotes)
  result = result.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="cb-string">$1</span>')

  // Strings (single quotes)
  result = result.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="cb-string">$1</span>')

  // Template literals
  result = result.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span class="cb-string">$1</span>')

  // Keywords
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g')
    result = result.replace(regex, '<span class="cb-keyword">$1</span>')
  })

  // Types
  types.forEach(t => {
    const regex = new RegExp(`\\b(${t})\\b`, 'g')
    result = result.replace(regex, '<span class="cb-type">$1</span>')
  })

  // Function calls
  result = result.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="cb-function">$1</span>(')

  // JSX/HTML tags
  result = result.replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="cb-tag">$2</span>')

  // Property names in object types
  result = result.replace(/^\s*(\w+)(\??:)/gm, '  <span class="cb-property">$1</span>$2')

  return result
}

const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

onMounted(() => {
  highlightedCode.value = highlight(props.code, props.language)
})

watch(() => props.code, (newCode) => {
  highlightedCode.value = highlight(newCode, props.language)
})
</script>

<template>
  <pre class="code-block" v-html="highlightedCode"></pre>
</template>

<style scoped>
.code-block :deep(.cb-keyword) {
  color: #d73a49;
}
.code-block :deep(.cb-string) {
  color: #032f62;
}
.code-block :deep(.cb-comment) {
  color: #6a737d;
}
.code-block :deep(.cb-type) {
  color: #6f42c1;
}
.code-block :deep(.cb-function) {
  color: #6f42c1;
}
.code-block :deep(.cb-tag) {
  color: #22863a;
}
.code-block :deep(.cb-property) {
  color: #005cc5;
}
</style>
