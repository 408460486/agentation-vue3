<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Agentation } from 'agentation-vue3'
import type { DemoAnnotation } from 'agentation-vue3'

// Example annotations that animate in on page load
const demoAnnotations: DemoAnnotation[] = [
  {
    selector: ".demo-button",
    comment:
      "Try clicking this button - you can annotate any element on the page!",
  },
  {
    selector: ".demo-card h3",
    comment: "Annotations work on text elements too",
  },
  {
    selector: ".slider-circle",
    comment: "Use the pause button to freeze animations before annotating",
  },
]

const isMobile = ref(false)

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
})
</script>

<template>
  <Agentation
    v-if="!isMobile"
    :demo-annotations="demoAnnotations"
    :demo-delay="1500"
    enable-demo-mode
  />
</template>
