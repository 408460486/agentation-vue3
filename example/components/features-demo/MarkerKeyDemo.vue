<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <ul class="mkd-list">
    <li>
      <span class="mkd-marker-wrap"><span class="mkd-marker blue">1</span></span>
      {{ t('markerKey.singleElement') }}
    </li>
    <li>
      <span class="mkd-marker-wrap"><span class="mkd-marker green">1</span></span>
      {{ t('markerKey.multiSelect') }}
    </li>
  </ul>
</template>
