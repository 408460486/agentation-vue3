<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <footer class="footer" style="display: flex; justify-content: space-between; align-items: center;">
    <p>
      {{ t('footer.madeBy') }}
      <a
        href="https://github.com/408460486"
        target="_blank"
        rel="noopener noreferrer"
      >Binyy</a>{{ t('footer.forkedFrom') }}
      <a
        href="https://x.com/benjitaylor"
        target="_blank"
        rel="noopener noreferrer"
      >Benji Taylor</a>、<a
        href="https://x.com/seldom"
        target="_blank"
        rel="noopener noreferrer"
      >Dennis Jin</a>{{ t('footer.and') }}
      <a
        href="https://x.com/alexvanderzon"
        target="_blank"
        rel="noopener noreferrer"
      >Alex Vanderzon</a>{{ t('footer.reactVersion') }}
    </p>
  </footer>
</template>
