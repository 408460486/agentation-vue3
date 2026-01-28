<script setup lang="ts">
import { ref, computed } from 'vue'
import TextSelectionDemo from './TextSelectionDemo.vue'
import ElementClickDemo from './ElementClickDemo.vue'
import MultiSelectDemo from './MultiSelectDemo.vue'
import AreaSelectionDemo from './AreaSelectionDemo.vue'
import AnimationPauseDemo from './AnimationPauseDemo.vue'
import './FeaturesDemo.css'

type FeatureKey = 'text-selection' | 'element-click' | 'multi-select' | 'area-selection' | 'animation-pause'

interface Feature {
  key: FeatureKey
  label: string
  caption: string
}

const features: Feature[] = [
  {
    key: 'text-selection',
    label: 'Text',
    caption: 'Select text to annotate typos, content issues, or copy changes.\nThe quoted text is included in the output.',
  },
  {
    key: 'element-click',
    label: 'Elements',
    caption: 'Click any element to add feedback.\nAgentation identifies it by class name, ID, or semantic content.',
  },
  {
    key: 'multi-select',
    label: 'Multi-Select',
    caption: 'Drag to select multiple elements at once.\nAll selected elements are included in a single annotation.',
  },
  {
    key: 'area-selection',
    label: 'Area',
    caption: 'Drag to select any region, even empty space.\nUseful for layout feedback or indicating where something should go.',
  },
  {
    key: 'animation-pause',
    label: 'Animation',
    caption: 'Freeze CSS animations to annotate specific states.\nClick pause in the toolbar to stop all animations.',
  },
]

const activeFeature = ref<FeatureKey>('text-selection')
const animationKey = ref(0)

const handleFeatureChange = (feature: FeatureKey) => {
  activeFeature.value = feature
  animationKey.value++
}

const currentFeature = computed(() => features.find(f => f.key === activeFeature.value)!)
</script>

<template>
  <div class="fd-container">
    <div class="fd-tabs">
      <button
        v-for="feature in features"
        :key="feature.key"
        :class="['fd-tab', { active: activeFeature === feature.key }]"
        @click="handleFeatureChange(feature.key)"
      >
        {{ feature.label }}
      </button>
    </div>

    <div class="fd-demo">
      <TextSelectionDemo v-if="activeFeature === 'text-selection'" :key="animationKey" />
      <ElementClickDemo v-else-if="activeFeature === 'element-click'" :key="animationKey" />
      <MultiSelectDemo v-else-if="activeFeature === 'multi-select'" :key="animationKey" />
      <AreaSelectionDemo v-else-if="activeFeature === 'area-selection'" :key="animationKey" />
      <AnimationPauseDemo v-else-if="activeFeature === 'animation-pause'" :key="animationKey" />
    </div>

    <p
      :key="activeFeature"
      style="margin-top: 1rem; font-size: 0.75rem; color: rgba(0,0,0,0.5); white-space: pre-line; line-height: 1.3; animation: fadeIn 0.3s ease"
    >
      {{ currentFeature.caption }}
    </p>
  </div>
</template>
