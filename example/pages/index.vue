<script setup lang="ts">
import { ref } from 'vue'
import HeroDemo from '../components/HeroDemo.vue'
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()
const inputValue = ref('')

const handlePrimaryClick = () => {
  alert('Primary clicked!')
}

const handleSecondaryClick = () => {
  alert('Secondary clicked!')
}
</script>

<template>
  <div>
    <article class="article">
      <header>
        <h1>{{ t('index.title') }}</h1>
        <p class="tagline">{{ t('index.tagline') }}</p>
        <HeroDemo />
      </header>

      <!-- Author Credits -->
      <div class="author-credits">
        <p>
          <strong>{{ t('index.madeBy') }} <a href="https://github.com/408460486" target="_blank" rel="noopener noreferrer">binyy</a></strong>{{ t('index.forkedFrom') }}
          <a href="https://x.com/benjitaylor" target="_blank" rel="noopener noreferrer">Benji Taylor</a>,
          <a href="https://x.com/seldom" target="_blank" rel="noopener noreferrer">Dennis Jin</a>, {{ t('index.and') }}
          <a href="https://x.com/alexvanderzon" target="_blank" rel="noopener noreferrer">Alex Vanderzon</a> {{ t('index.reactVersion') }}
        </p>
        <p class="author-credits-links">
          {{ t('index.originalReactVersion') }}
          <a href="https://github.com/benjitaylor/agentation" target="_blank" rel="noopener noreferrer">GitHub</a> ·
          <a href="https://www.npmjs.com/package/agentation" target="_blank" rel="noopener noreferrer">NPM</a>
        </p>
      </div>

      <section>
        <p>{{ t('index.description1') }}</p>
        <p>{{ t('index.description2') }}</p>
        <p>{{ t('index.description3') }}</p>
        <p>
          {{ t('index.description4') }}<a href="https://benji.org/annotating" class="styled-link" target="_blank" rel="noopener noreferrer">{{ t('index.aPostBy') }}</a>{{ t('index.exploring') }}
        </p>
      </section>

      <section>
        <h2>{{ t('quickStart.title') }}</h2>
        <ol>
          <li>
            <svg style="display: inline-block; vertical-align: -0.45em; width: 1.5em; height: 1.5em; margin: 0 -0.1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11.5 12L5.5 12" />
              <path d="M18.5 6.75L5.5 6.75" />
              <path d="M9.25 17.25L5.5 17.25" />
              <path d="M16 12.75L16.5179 13.9677C16.8078 14.6494 17.3506 15.1922 18.0323 15.4821L19.25 16L18.0323 16.5179C17.3506 16.8078 16.8078 17.3506 16.5179 18.0323L16 19.25L15.4821 18.0323C15.1922 17.3506 14.6494 16.8078 13.9677 16.5179L12.75 16L13.9677 15.4821C14.6494 15.1922 15.1922 14.6494 15.4821 13.9677L16 12.75Z" />
            </svg>
            {{ t('quickStart.step1') }}
          </li>
          <li><strong>{{ t('quickStart.step2Hover') }}</strong> {{ t('quickStart.step2Text') }}</li>
          <li><strong>{{ t('quickStart.step3Click') }}</strong> {{ t('quickStart.step3Text') }}</li>
          <li>{{ t('quickStart.step4') }} <strong>{{ t('quickStart.step4Add') }}</strong></li>
          <li>
            {{ t('quickStart.step5') }}
            <svg style="display: inline-block; vertical-align: -0.45em; width: 1.5em; height: 1.5em; margin: 0 -0.1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M4.75 11.25C4.75 10.4216 5.42157 9.75 6.25 9.75H12.75C13.5784 9.75 14.25 10.4216 14.25 11.25V17.75C14.25 18.5784 13.5784 19.25 12.75 19.25H6.25C5.42157 19.25 4.75 18.5784 4.75 17.75V11.25Z" />
              <path d="M17.25 14.25H17.75C18.5784 14.25 19.25 13.5784 19.25 12.75V6.25C19.25 5.42157 18.5784 4.75 17.75 4.75H11.25C10.4216 4.75 9.75 5.42157 9.75 6.25V6.75" />
            </svg>
            {{ t('quickStart.step5Text') }}
          </li>
          <li>{{ t('quickStart.step6') }}</li>
        </ol>
      </section>

      <section>
        <h2>{{ t('howItWorks.title') }}</h2>
        <p>{{ t('howItWorks.intro') }}</p>
        <ol>
          <li>{{ t('howItWorks.step1') }}</li>
          <li>{{ t('howItWorks.step2') }}</li>
          <li>{{ t('howItWorks.step3') }}</li>
          <li>{{ t('howItWorks.step4') }} <strong>{{ t('howItWorks.step4Bold') }}</strong></li>
          <li>{{ t('howItWorks.step5') }}</li>
        </ol>
        <p>
          {{ t('howItWorks.without') }}
          <code>.sidebar > .nav-actions > button.primary</code> {{ t('howItWorks.andItCan') }}
        </p>
      </section>

      <!-- Interactive Demo Section - hidden on mobile since tool is desktop-only -->
      <section class="demo-section hide-on-mobile">
        <h2>{{ t('tryIt.title') }}</h2>
        <p>{{ t('tryIt.intro') }}</p>

        <div class="demo-elements">
          <div class="button-group">
            <button class="demo-button" @click="handlePrimaryClick">
              {{ t('tryIt.primaryButton') }}
            </button>
            <button class="demo-button secondary" @click="handleSecondaryClick">
              {{ t('tryIt.secondaryButton') }}
            </button>
          </div>

          <input
            type="text"
            class="demo-input"
            :placeholder="t('tryIt.inputPlaceholder')"
            v-model="inputValue"
          />

          <div class="demo-card">
            <h3>{{ t('tryIt.cardTitle') }}</h3>
            <p>{{ t('tryIt.cardText') }}</p>
          </div>
        </div>
      </section>

      <!-- Animation Demo - hidden on mobile since tool is desktop-only -->
      <section class="demo-section hide-on-mobile">
        <h2>{{ t('animationDemo.title') }}</h2>
        <p>
          {{ t('animationDemo.intro') }}
          <svg style="display: inline-block; vertical-align: -0.45em; width: 1.5em; height: 1.5em; margin: 0 -0.1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M8 6L8 18" />
            <path d="M16 18L16 6" />
          </svg>
          {{ t('animationDemo.introEnd') }}
        </p>
        <div class="animation-demo">
          <div class="progress-bar-demo">
            <div class="progress-bar" />
          </div>
        </div>
      </section>

      <section>
        <h2>{{ t('bestPractices.title') }}</h2>
        <ul>
          <li><strong>{{ t('bestPractices.specific') }}</strong> {{ t('bestPractices.specificDesc') }}</li>
          <li><strong>{{ t('bestPractices.oneIssue') }}</strong> {{ t('bestPractices.oneIssueDesc') }}</li>
          <li><strong>{{ t('bestPractices.includeContext') }}</strong> {{ t('bestPractices.includeContextDesc') }}</li>
          <li><strong>{{ t('bestPractices.useTextSelection') }}</strong> {{ t('bestPractices.useTextSelectionDesc') }}</li>
          <li><strong>{{ t('bestPractices.pauseAnimations') }}</strong> {{ t('bestPractices.pauseAnimationsDesc') }}</li>
        </ul>
      </section>
    </article>

    <Footer />
  </div>
</template>
