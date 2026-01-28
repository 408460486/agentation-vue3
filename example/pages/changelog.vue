<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

type ChangeType = 'added' | 'fixed' | 'improved' | 'removed'

interface Change {
  type: ChangeType
  text: string
}

interface Release {
  version: string
  date: string
  summary?: string
  changes?: Change[]
}

const badgeLabels: Record<ChangeType, string> = {
  added: 'Added',
  fixed: 'Fixed',
  improved: 'Improved',
  removed: 'Removed',
}

// Computed badge labels for i18n
const getBadgeLabel = (type: ChangeType): string => {
  const labels: Record<ChangeType, string> = {
    added: t('changelog.added'),
    fixed: t('changelog.fixed'),
    improved: t('changelog.improved'),
    removed: t('changelog.removed'),
  }
  return labels[type]
}

const releases: Release[] = [
  {
    version: '1.3.2',
    date: 'January 24, 2026',
    changes: [
      { type: 'fixed', text: 'Blurry tooltip text on marker hover (counter-scaled to offset parent transform)' },
      { type: 'improved', text: 'Unified quote text styling between marker tooltip and annotation popup' },
      { type: 'improved', text: 'Tooltip font and padding consistency' },
    ],
  },
  {
    version: '1.3.1',
    date: 'January 23, 2026',
    changes: [
      { type: 'added', text: 'Custom tooltips with arrows on toolbar buttons' },
      { type: 'added', text: 'Subtle stroke around marker dots for better visibility' },
      { type: 'improved', text: 'Help icon design and tooltip styling' },
    ],
  },
  {
    version: '1.3.0',
    date: 'January 23, 2026',
    changes: [
      { type: 'added', text: 'Collapsible computed styles section in annotation popup — click the chevron to view CSS properties for the selected element' },
      { type: 'improved', text: 'Toolbar polish and visual refinements' },
    ],
  },
  {
    version: '1.2.0',
    date: 'January 22, 2026',
    changes: [
      { type: 'added', text: 'Programmatic API: @annotation-add, @annotation-delete, @annotation-update, @annotations-clear, @copy events' },
      { type: 'added', text: 'copy-to-clipboard prop to control clipboard behavior' },
    ],
  },
  {
    version: '1.1.1',
    date: 'January 22, 2026',
    changes: [
      { type: 'fixed', text: 'Vue key prop warning in color picker' },
    ],
  },
  {
    version: '1.1.0',
    date: 'January 21, 2026',
    changes: [
      { type: 'improved', text: 'Package exports now have proper TypeScript type conditions' },
    ],
  },
  {
    version: '1.0.0',
    date: 'January 21, 2026',
    summary: 'First stable release of agentation-vue3. Vue 3 port of the React version with full feature parity. Click elements to annotate them, select text, drag to multi-select. Multiple output detail levels, keyboard shortcuts, customizable marker colors, and localStorage persistence.',
  },
]

const changeTypes: ChangeType[] = ['fixed', 'improved', 'added', 'removed']
</script>

<template>
  <div>
    <article class="article">
      <header>
        <h1>{{ t('changelog.title') }}</h1>
        <p class="tagline">{{ t('changelog.tagline') }}</p>
      </header>

      <section v-for="release in releases" :key="release.version">
        <h2>
          <a
            :href="`https://www.npmjs.com/package/agentation-vue3/v/${release.version}`"
            target="_blank"
            rel="noopener noreferrer"
            style="color: inherit; text-decoration: none"
          >
            {{ release.version }}
          </a>
          <span style="font-weight: 400; color: rgba(0, 0, 0, 0.35); margin-left: 0">
            {{ release.date }}
          </span>
        </h2>

        <p v-if="release.summary">{{ release.summary }}</p>

        <div v-if="release.changes && release.changes.length > 0" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem">
          <template v-for="type in changeTypes" :key="type">
            <div v-if="release.changes!.filter(c => c.type === type).length > 0">
              <div style="font-size: 0.6875rem; font-weight: 500; color: rgba(0, 0, 0, 0.4); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.5rem">
                {{ getBadgeLabel(type) }}
              </div>
              <ul>
                <li v-for="(change, j) in release.changes!.filter(c => c.type === type)" :key="j">
                  <template v-if="change.link">
                    <NuxtLink :to="change.link.href" class="styled-link">{{ change.link.label }}</NuxtLink>: {{ change.text }}
                  </template>
                  <template v-else>
                    {{ change.text }}
                  </template>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </section>
    </article>

    <Footer />
  </div>
</template>
