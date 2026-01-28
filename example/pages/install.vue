<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
const copiedStates = ref<Record<string, boolean>>({})

const copyToClipboard = async (text: string, key: string) => {
  await navigator.clipboard.writeText(text)
  copiedStates.value[key] = true
  setTimeout(() => {
    copiedStates.value[key] = false
  }, 2000)
}
</script>

<template>
  <div>
    <article class="article">
      <header>
        <h1>{{ t('install.title') }}</h1>
        <p class="tagline">{{ t('install.tagline') }}</p>
      </header>

      <section>
        <h2>{{ t('install.installPackage') }}</h2>
        <div style="position: relative">
          <pre class="code-block">npm install agentation-vue3</pre>
          <button
            class="copy-button"
            title="Copy to clipboard"
            @click="copyToClipboard('npm install agentation-vue3', 'install')"
            :style="{
              position: 'absolute',
              top: '50%',
              right: '0.75rem',
              transform: 'translateY(-50%)',
              padding: '0.375rem',
              background: 'transparent',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              color: copiedStates['install'] ? '#22c55e' : 'rgba(0,0,0,0.35)',
              transition: 'color 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }"
          >
            <svg v-if="copiedStates['install']" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12L10 17L19 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4.75 11.25C4.75 10.4216 5.42157 9.75 6.25 9.75H12.75C13.5784 9.75 14.25 10.4216 14.25 11.25V17.75C14.25 18.5784 13.5784 19.25 12.75 19.25H6.25C5.42157 19.25 4.75 18.5784 4.75 17.75V11.25Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M17.25 14.25H17.75C18.5784 14.25 19.25 13.5784 19.25 12.75V6.25C19.25 5.42157 18.5784 4.75 17.75 4.75H11.25C10.4216 4.75 9.75 5.42157 9.75 6.25V6.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <p style="font-size: 0.875rem; color: rgba(0,0,0,0.5); margin-top: 0.5rem">
          {{ t('install.orUse') }}
        </p>
      </section>

      <section>
        <h2>{{ t('install.addToApp') }}</h2>
        <p>
          {{ t('install.addToAppDesc') }}<code>import.meta.env.DEV</code> {{ t('install.addToAppDesc2') }}
        </p>
        <pre class="code-block">&lt;script setup lang="ts"&gt;
import { Agentation } from "agentation-vue3";
&lt;/script&gt;

&lt;template&gt;
  &lt;YourApp /&gt;
  &lt;Agentation v-if="import.meta.env.DEV" /&gt;
&lt;/template&gt;</pre>
      </section>

      <section>
        <h2>{{ t('install.nuxt3') }}</h2>
        <p>
          {{ t('install.nuxt3Desc') }}<code>app.vue</code> {{ t('install.nuxt3Desc2') }}
        </p>
        <pre class="code-block">&lt;script setup lang="ts"&gt;
import { Agentation } from "agentation-vue3";
&lt;/script&gt;

&lt;template&gt;
  &lt;NuxtLayout&gt;
    &lt;NuxtPage /&gt;
  &lt;/NuxtLayout&gt;
  &lt;Agentation /&gt;
&lt;/template&gt;</pre>
        <p style="font-size: 0.875rem; color: rgba(0,0,0,0.5); margin-top: 0.5rem">
          {{ t('install.nuxt3Css') }}<code>nuxt.config.ts</code>:
        </p>
        <pre class="code-block">export default defineNuxtConfig({
  css: ['agentation-vue3/dist/style.css'],
  ssr: false, // Required for DOM manipulation
})</pre>
      </section>

      <section>
        <h2>{{ t('install.requirements') }}</h2>
        <ul>
          <li><strong>{{ t('install.reqVue') }}</strong> {{ t('install.reqVueDesc') }}</li>
          <li><strong>{{ t('install.reqClient') }}</strong> {{ t('install.reqClientDesc') }}</li>
          <li><strong>{{ t('install.reqDesktop') }}</strong> {{ t('install.reqDesktopDesc') }}</li>
          <li><strong>{{ t('install.reqZero') }}</strong> {{ t('install.reqZeroDesc') }}</li>
        </ul>
      </section>

      <section>
        <h2>{{ t('install.props') }}</h2>
        <p>
          {{ t('install.propsDesc') }}<code>Agentation</code> {{ t('install.propsDesc2') }}
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem">
          <thead>
            <tr style="border-bottom: 1px solid rgba(0,0,0,0.1)">
              <th style="text-align: left; padding: 0.5rem 1rem 0.5rem 0">Prop</th>
              <th style="text-align: left; padding: 0.5rem 1rem 0.5rem 0">Type</th>
              <th style="text-align: left; padding: 0.5rem 0">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid rgba(0,0,0,0.05)">
              <td style="padding: 0.5rem 1rem 0.5rem 0"><code>@annotation-add</code></td>
              <td style="padding: 0.5rem 1rem 0.5rem 0"><code>(annotation: Annotation) =&gt; void</code></td>
              <td style="padding: 0.5rem 0">{{ t('install.propEvent') }}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 1rem 0.5rem 0"><code>copy-to-clipboard</code></td>
              <td style="padding: 0.5rem 1rem 0.5rem 0"><code>boolean</code></td>
              <td style="padding: 0.5rem 0">{{ t('install.propCopyDesc') }}<code>true</code>)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{{ t('install.programmatic') }}</h2>
        <p>
          {{ t('install.programmaticDesc') }}<code>@annotation-add</code> {{ t('install.programmaticDesc2') }}<NuxtLink to="/api">API</NuxtLink>{{ t('install.programmaticDesc3') }}
        </p>
        <pre class="code-block">&lt;script setup lang="ts"&gt;
import { Agentation, type Annotation } from "agentation-vue3";

const handleAnnotation = (annotation: Annotation) =&gt; {
  // Structured data - no parsing needed
  console.log(annotation.element);      // "Button"
  console.log(annotation.elementPath);  // "body &gt; div &gt; button"
  console.log(annotation.boundingBox);  // { x, y, width, height }

  // Send to your agent, API, etc.
  sendToAgent(annotation);
};
&lt;/script&gt;

&lt;template&gt;
  &lt;YourApp /&gt;
  &lt;Agentation
    @annotation-add="handleAnnotation"
    :copy-to-clipboard="false"
  /&gt;
&lt;/template&gt;</pre>
      </section>

      <section>
        <h2>{{ t('install.security') }}</h2>
        <p>
          {{ t('install.securityDesc') }}<strong>{{ t('install.securityNot') }}</strong>{{ t('install.securityDesc2') }}
        </p>
        <ul>
          <li><strong>{{ t('install.secNoNetwork') }}</strong> {{ t('install.secNoNetworkDesc') }}</li>
          <li><strong>{{ t('install.secNoData') }}</strong> {{ t('install.secNoDataDesc') }}</li>
          <li><strong>{{ t('install.secDevOnly') }}</strong> {{ t('install.secDevOnlyDesc') }}<code>import.meta.env.DEV</code> {{ t('install.secDevOnlyDesc2') }}</li>
        </ul>
      </section>
    </article>

    <Footer />
  </div>
</template>
