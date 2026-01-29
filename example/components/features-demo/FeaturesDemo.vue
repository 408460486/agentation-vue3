<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import TextSelectionDemo from './TextSelectionDemo.vue'
import ElementClickDemo from './ElementClickDemo.vue'
import MultiSelectDemo from './MultiSelectDemo.vue'
import AreaSelectionDemo from './AreaSelectionDemo.vue'
import AnimationPauseDemo from './AnimationPauseDemo.vue'
import './FeaturesDemo.css'

const { t } = useI18n()

type FeatureKey = 'text-selection' | 'element-click' | 'multi-select' | 'area-selection' | 'animation-pause'

interface Feature {
  key: FeatureKey
  labelKey: string
  captionKey: string
}

const features: Feature[] = [
  {
    key: 'text-selection',
    labelKey: 'featuresDemo.text',
    captionKey: 'featuresDemo.textCaption',
  },
  {
    key: 'element-click',
    labelKey: 'featuresDemo.elements',
    captionKey: 'featuresDemo.elementsCaption',
  },
  {
    key: 'multi-select',
    labelKey: 'featuresDemo.multiSelect',
    captionKey: 'featuresDemo.multiSelectCaption',
  },
  {
    key: 'area-selection',
    labelKey: 'featuresDemo.area',
    captionKey: 'featuresDemo.areaCaption',
  },
  {
    key: 'animation-pause',
    labelKey: 'featuresDemo.animation',
    captionKey: 'featuresDemo.animationCaption',
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
        {{ t(feature.labelKey) }}
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
      {{ t(currentFeature.captionKey) }}
    </p>
  </div>
</template>
