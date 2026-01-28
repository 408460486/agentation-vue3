<script setup lang="ts">
import { useI18n, type Locale } from '../composables/useI18n'

const { locale, t, setLocale, availableLocales } = useI18n()

const languages: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'zh', label: '中文' },
]

const toggleLocale = () => {
  const currentIndex = availableLocales.indexOf(locale.value)
  const nextIndex = (currentIndex + 1) % availableLocales.length
  setLocale(availableLocales[nextIndex])
}
</script>

<template>
  <button class="language-selector" @click="toggleLocale" :title="t('language')">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
    <span class="language-text">{{ locale === 'en' ? 'EN' : '中文' }}</span>
  </button>
</template>

<style scoped lang="scss">
.language-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    border-color: rgba(0, 0, 0, 0.2);
    color: rgba(0, 0, 0, 0.85);
  }

  svg {
    opacity: 0.6;
  }

  &:hover svg {
    opacity: 1;
  }
}

.language-text {
  min-width: 24px;
  text-align: center;
}
</style>
