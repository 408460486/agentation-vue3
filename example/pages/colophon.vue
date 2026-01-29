<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const bunnyArt = `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣤⣤⡄⢠⣤⣤⡄⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡟⢦⡀⠛⣿⠁⠀⢹⣇⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢻⡆⠓⡆⠛⣶⠀⠀⣿⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢹⡆⠓⡄⢹⡆⠀⠉⣷⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⡇⢹⠈⢹⡇⠀⡿⣤⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⡀⠈⣿⣀⣹⠀⠙⠛⠃⠘⠛⢣⣄⠀⠀
⠀⠀⠀⠀⣰⠶⠞⠛⠛⠛⠛⠳⠶⣆⡿⠀⠀⠀⠀⢀⣀⣤⠀⠙⣷⠀
⠀⠀⣤⠾⠉⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠸⠿⠿⠀⠀⣉⣷
⠀⢸⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⣿
⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣤⣤⡟⠛⠀
⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀
⠸⢧⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀
⠀⠺⣧⡀⢠⣀⠀⠀⣀⣟⠛⠛⣧⣄⡀⠀⠀⣸⡇⠀⣿⠉⠀⠀⠀⠀
⠀⠀⠀⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠀⠀⠀⠀⠀⠀`

const COLORS = ['#4f46e5', '#7c3aed', '#e11d77', '#f97316', '#059669']

// Seeded random for consistent "imperfect" delays
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

interface CharData {
  char: string
  line: number
  col: number
  isNewline: boolean
  randomOffset: number
}

// Pre-calculate character data
const charData = computed<CharData[]>(() => {
  const chars = bunnyArt.split('')
  let lineIndex = 0
  let colIndex = 0

  return chars.map((char, i) => {
    if (char === '\n') {
      lineIndex++
      colIndex = 0
      return { char, line: lineIndex - 1, col: colIndex, isNewline: true, randomOffset: 0 }
    }
    const randomOffset = (seededRandom(i * 7 + 13) - 0.5) * 180
    const data = { char, line: lineIndex, col: colIndex, isNewline: false, randomOffset }
    colIndex++
    return data
  })
})

const visibleChars = computed(() => charData.value.filter(d => !d.isNewline))

const containerRef = ref<HTMLSpanElement | null>(null)
let frameRef = 0
let startTimeRef = 0

const updateStyles = (time: number) => {
  if (!containerRef.value) return

  const elapsed = time - startTimeRef
  const tick = elapsed / 40

  const introPhase = Math.min(elapsed / 3000, 1)
  const colorThreshold = 0.6 - introPhase * 0.4
  const opacityBoost = (1 - introPhase) * 0.2

  const spans = containerRef.value.children
  let spanIndex = 0

  for (let i = 0; i < charData.value.length; i++) {
    const { isNewline, line, col, randomOffset } = charData.value[i]
    if (isNewline) continue

    const span = spans[spanIndex] as HTMLSpanElement
    if (!span) { spanIndex++; continue }

    const baseDelay = (line * 35) + (col * 10)
    const revealDelay = Math.max(0, baseDelay + randomOffset)
    const charVisible = elapsed > revealDelay
    const revealProgress = charVisible ? Math.min((elapsed - revealDelay) / 450, 1) : 0

    const wave1 = (tick + i) % 150
    const wave2 = (tick * 0.7 + i + 75) % 150
    const intensity1 = wave1 < 30 ? Math.sin((wave1 / 30) * Math.PI) : 0
    const intensity2 = wave2 < 30 ? Math.sin((wave2 / 30) * Math.PI) : 0
    const intensity = Math.max(intensity1, intensity2)

    const waveOpacity = 0.08 + intensity * (0.35 + opacityBoost)
    const opacity = waveOpacity * revealProgress

    const useColor = intensity > colorThreshold
    const color = useColor ? COLORS[i % COLORS.length] : ''

    span.style.opacity = String(opacity)
    span.style.color = color

    spanIndex++
  }

  frameRef = requestAnimationFrame(updateStyles)
}

onMounted(() => {
  startTimeRef = performance.now()
  frameRef = requestAnimationFrame(updateStyles)
})

onUnmounted(() => {
  if (frameRef) {
    cancelAnimationFrame(frameRef)
  }
})

// Check if next char is on a different line (for line break insertion)
const needsLineBreak = (index: number) => {
  if (index >= visibleChars.value.length - 1) return false
  return visibleChars.value[index + 1].line !== visibleChars.value[index].line
}
</script>

<template>
  <div>
    <div class="colophon-page">
      <h1>Colophon</h1>

      <div class="colophon-content">
        <p>
          Agentation is a Vue 3 component for annotating web pages and generating structured
          feedback for AI coding agents. Zero runtime dependencies beyond Vue 3.3+, written
          in TypeScript with full type definitions. Available on <a href="https://www.npmjs.com/package/agentation-vue3" target="_blank" rel="noopener noreferrer">npm</a> and <a href="https://github.com/benjitaylor/agentation" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
        <p>
          Made by <a href="https://x.com/benjitaylor" target="_blank" rel="noopener noreferrer">Benji Taylor</a>, <a href="https://x.com/seldom" target="_blank" rel="noopener noreferrer">Dennis Jin</a>, and <a href="https://x.com/alexvanderzon" target="_blank" rel="noopener noreferrer">Alex Vanderzon</a>,
          with help from <a href="https://claude.ai/code" target="_blank" rel="noopener noreferrer">Claude Code</a>.<br />
          See <a href="https://benji.org/annotating" target="_blank" rel="noopener noreferrer">the original post</a> for
          more on the motivation behind the project.
        </p>

        <div class="colophon-table-wrapper">
          <!-- Animated Bunny -->
          <span class="colophon-bunny" ref="containerRef">
            <span
              v-for="(data, i) in visibleChars"
              :key="i"
              :style="{ opacity: 0 }"
            >{{ data.char }}{{ needsLineBreak(i) ? '\n' : '' }}</span>
          </span>

          <div class="colophon-table">
            <div class="colophon-row">
              <span class="colophon-row-label">Framework</span>
              <span class="colophon-row-value"><a href="https://nuxt.com" target="_blank" rel="noopener noreferrer">Nuxt 3</a></span>
            </div>
            <div class="colophon-row">
              <span class="colophon-row-label">Hosting</span>
              <span class="colophon-row-value"><a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a></span>
            </div>
            <div class="colophon-row">
              <span class="colophon-row-label">Typeface</span>
              <span class="colophon-row-value"><a href="https://rsms.me/inter" target="_blank" rel="noopener noreferrer">Inter</a></span>
            </div>
            <div class="colophon-row">
              <span class="colophon-row-label">Icons</span>
              <span class="colophon-row-value"><a href="https://dip.org" target="_blank" rel="noopener noreferrer">Dip</a></span>
            </div>
            <div class="colophon-row">
              <span class="colophon-row-label" style="display: flex; align-items: center; gap: 0.25rem">
                <svg xmlns="http://www.w3.org/2000/svg" height="11" viewBox="0 0 20 20" width="11" fill="currentColor" style="opacity: 0.5"><path d="M10.75,6.37C11.39,6.15,11.9,5.64,12.12,5H15l-2.5,5.75c0,1.24,1.23,2.25,2.75,2.25c1.52,0,2.75-1.01,2.75-2.25L15.5,5H17 V3.5h-4.88C11.81,2.63,10.98,2,10,2S8.19,2.63,7.88,3.5H3V5h1.5L2,10.75C2,11.99,3.23,13,4.75,13s2.75-1.01,2.75-2.25L5,5h2.88 C8.1,5.64,8.61,6.15,9.25,6.37v9.13H2V17h16v-1.5h-7.25V6.37z M16.91,10.75h-3.32l1.66-3.82L16.91,10.75z M6.41,10.75H3.09 l1.66-3.82L6.41,10.75z M10,5C9.59,5,9.25,4.66,9.25,4.25C9.25,3.84,9.59,3.5,10,3.5s0.75,0.34,0.75,0.75C10.75,4.66,10.41,5,10,5z"/></svg>
                License
              </span>
              <span class="colophon-row-value"><a href="https://github.com/benjitaylor/agentation/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">PolyForm Shield</a></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.colophon-page {
  max-width: 36rem;
  margin: 0 auto;
  padding: 4rem 1.5rem 3rem;
}
@media (max-width: 900px) {
  .colophon-page {
    padding-top: 2rem;
  }
}
.colophon-page h1 {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 1.25rem;
}
.colophon-content {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.8;
}
.colophon-content p {
  margin-bottom: 0.5rem;
}
.colophon-content a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.colophon-content a:hover {
  color: rgba(255, 255, 255, 0.75);
}
.colophon-table-wrapper {
  position: relative;
  margin-top: 1.5rem;
}
.colophon-table {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}
.colophon-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
  border-bottom: 1px dotted rgba(255, 255, 255, 0.12);
}
.colophon-row:last-child {
  border-bottom: none;
}
.colophon-row-label {
  color: rgba(255, 255, 255, 0.45);
}
.colophon-row-value {
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
}
.colophon-row-value a {
  color: rgba(255, 255, 255, 0.6);
}
.colophon-bunny {
  position: absolute;
  top: -2rem;
  right: 2rem;
  white-space: pre;
  line-height: 1;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  pointer-events: none;
  z-index: 0;
}
</style>