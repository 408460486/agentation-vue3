<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  icon: string
  active?: boolean
  disabled?: boolean
}>()

const prevIcon = ref(props.icon)
const animating = ref(false)

watch(() => props.icon, (newIcon) => {
  if (newIcon !== prevIcon.value) {
    animating.value = true
    prevIcon.value = newIcon
    setTimeout(() => animating.value = false, 200)
  }
})

const activeStyle = computed(() => props.active ? {
  color: '#3b82f6',
  backgroundColor: 'rgba(59, 130, 246, 0.25)',
  borderRadius: '50%',
} : undefined)

const disabledStyle = computed(() => props.disabled ? {
  opacity: 0.35,
} : undefined)
</script>

<template>
  <div :class="['demo-toolbar-btn', { active }]" :style="{ ...activeStyle, ...disabledStyle }">
    <div :class="['demo-toolbar-icon', { animating }]">
      <!-- Pause -->
      <svg v-if="icon === 'pause'" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M8 6L8 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M16 18L16 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <!-- Play -->
      <svg v-else-if="icon === 'play'" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M17.75 10.701C18.75 11.2783 18.75 12.7217 17.75 13.299L8.75 18.4952C7.75 19.0725 6.5 18.3509 6.5 17.1962L6.5 6.80384C6.5 5.64914 7.75 4.92746 8.75 5.50481L17.75 10.701Z" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <!-- Eye -->
      <svg v-else-if="icon === 'eye'" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3.91752 12.7539C3.65127 12.2996 3.65037 11.7515 3.9149 11.2962C4.9042 9.59346 7.72688 5.49994 12 5.49994C16.2731 5.49994 19.0958 9.59346 20.0851 11.2962C20.3496 11.7515 20.3487 12.2996 20.0825 12.7539C19.0908 14.4459 16.2694 18.4999 12 18.4999C7.73064 18.4999 4.90918 14.4459 3.91752 12.7539Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 14.8261C13.5608 14.8261 14.8261 13.5608 14.8261 12C14.8261 10.4392 13.5608 9.17392 12 9.17392C10.4392 9.17392 9.17391 10.4392 9.17391 12C9.17391 13.5608 10.4392 14.8261 12 14.8261Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <!-- Copy -->
      <svg v-else-if="icon === 'copy'" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4.75 11.25C4.75 10.4216 5.42157 9.75 6.25 9.75H12.75C13.5784 9.75 14.25 10.4216 14.25 11.25V17.75C14.25 18.5784 13.5784 19.25 12.75 19.25H6.25C5.42157 19.25 4.75 18.5784 4.75 17.75V11.25Z" stroke="currentColor" stroke-width="1.5"/>
        <path d="M17.25 14.25H17.75C18.5784 14.25 19.25 13.5784 19.25 12.75V6.25C19.25 5.42157 18.5784 4.75 17.75 4.75H11.25C10.4216 4.75 9.75 5.42157 9.75 6.25V6.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <!-- Trash -->
      <svg v-else-if="icon === 'trash'" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M10 11.5L10.125 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 11.5L13.87 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 7.5V6.25C9 5.42157 9.67157 4.75 10.5 4.75H13.5C14.3284 4.75 15 5.42157 15 6.25V7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5.5 7.75H18.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M6.75 7.75L7.11691 16.189C7.16369 17.2649 7.18708 17.8028 7.41136 18.2118C7.60875 18.5717 7.91211 18.8621 8.28026 19.0437C8.69854 19.25 9.23699 19.25 10.3139 19.25H13.6861C14.763 19.25 15.3015 19.25 15.7197 19.0437C16.0879 18.8621 16.3912 18.5717 16.5886 18.2118C16.8129 17.8028 16.8363 17.2649 16.8831 16.189L17.25 7.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <!-- Settings -->
      <svg v-else-if="icon === 'settings'" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M10.6504 5.81117C10.9939 4.39628 13.0061 4.39628 13.3496 5.81117C13.5715 6.72517 14.6187 7.15891 15.4219 6.66952C16.6652 5.91193 18.0881 7.33479 17.3305 8.57815C16.8411 9.38134 17.2748 10.4285 18.1888 10.6504C19.6037 10.9939 19.6037 13.0061 18.1888 13.3496C17.2748 13.5715 16.8411 14.6187 17.3305 15.4219C18.0881 16.6652 16.6652 18.0881 15.4219 17.3305C14.6187 16.8411 13.5715 17.2748 13.3496 18.1888C13.0061 19.6037 10.9939 19.6037 10.6504 18.1888C10.4285 17.2748 9.38135 16.8411 8.57815 17.3305C7.33479 18.0881 5.91193 16.6652 6.66952 15.4219C7.15891 14.6187 6.72517 13.5715 5.81117 13.3496C4.39628 13.0061 4.39628 10.9939 5.81117 10.6504C6.72517 10.4285 7.15891 9.38134 6.66952 8.57815C5.91193 7.33479 7.33479 5.91192 8.57815 6.66952C9.38135 7.15891 10.4285 6.72517 10.6504 5.81117Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <!-- Close -->
      <svg v-else-if="icon === 'close'" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M16.25 16.25L7.75 7.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7.75 16.25L16.25 7.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
</template>
