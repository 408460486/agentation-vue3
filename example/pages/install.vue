<script setup lang="ts">
import { ref } from 'vue'

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
        <h1>Installation</h1>
        <p class="tagline">Get started with Agentation in your project</p>
      </header>

      <section>
        <h2>Install the package</h2>
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
          Or use yarn, pnpm, or bun.
        </p>
      </section>

      <section>
        <h2>Add to your app</h2>
        <p>
          Add the component anywhere in your Vue app, ideally at the root
          level. The <code>import.meta.env.DEV</code> check ensures it only loads in
          development.
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
        <h2>Nuxt 3</h2>
        <p>
          For Nuxt 3, add the component to your <code>app.vue</code> or layout:
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
          Don't forget to add the CSS in your <code>nuxt.config.ts</code>:
        </p>
        <pre class="code-block">export default defineNuxtConfig({
  css: ['agentation-vue3/dist/style.css'],
  ssr: false, // Required for DOM manipulation
})</pre>
      </section>

      <section>
        <h2>Requirements</h2>
        <ul>
          <li><strong>Vue 3.3+</strong> — Uses modern Vue features</li>
          <li><strong>Client-side only</strong> — Requires DOM access</li>
          <li><strong>Desktop only</strong> — Not optimized for mobile devices</li>
          <li><strong>Zero dependencies</strong> — No runtime deps beyond Vue</li>
        </ul>
      </section>

      <section>
        <h2>Props</h2>
        <p>
          The <code>Agentation</code> component accepts optional props for
          programmatic integration:
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
              <td style="padding: 0.5rem 0">Event fired when an annotation is added</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 1rem 0.5rem 0"><code>copy-to-clipboard</code></td>
              <td style="padding: 0.5rem 1rem 0.5rem 0"><code>boolean</code></td>
              <td style="padding: 0.5rem 0">Whether to copy to clipboard (default: <code>true</code>)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Programmatic integration</h2>
        <p>
          Use the <code>@annotation-add</code> event to receive structured
          annotation data directly. See the <NuxtLink to="/api">API page</NuxtLink> for all available events.
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
        <h2>Security notes</h2>
        <p>
          Agentation runs in your browser and reads DOM content to generate
          feedback. It does <strong>not</strong> send data anywhere —
          everything stays local until you manually copy and paste.
        </p>
        <ul>
          <li><strong>No network requests</strong> — all processing is client-side</li>
          <li><strong>No data collection</strong> — nothing is tracked or stored remotely</li>
          <li><strong>Dev-only</strong> — use the <code>import.meta.env.DEV</code> check to exclude from production</li>
        </ul>
      </section>
    </article>

    <Footer />
  </div>
</template>
