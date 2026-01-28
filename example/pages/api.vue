<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <div>
    <article class="article">
      <header>
        <h1>{{ t('api.title') }}</h1>
        <p class="tagline">{{ t('api.tagline') }}</p>
      </header>

      <section>
        <h2>{{ t('api.overview') }}</h2>
        <p>
          {{ t('api.overviewDesc') }}
        </p>
        <ul>
          <li>{{ t('api.overviewItem1') }}</li>
          <li>{{ t('api.overviewItem2') }}</li>
          <li>{{ t('api.overviewItem3') }}</li>
          <li>{{ t('api.overviewItem4') }}</li>
        </ul>
      </section>

      <section>
        <h2>{{ t('api.propsEvents') }}</h2>
        <div class="props-list">
          <div class="prop-item">
            <div class="prop-header">
              <code class="prop-name">@annotation-add</code>
              <span class="prop-type">(annotation: Annotation) =&gt; void</span>
            </div>
            <p class="prop-desc">{{ t('api.annotationAddDesc') }}</p>
          </div>
          <div class="prop-item">
            <div class="prop-header">
              <code class="prop-name">@annotation-delete</code>
              <span class="prop-type">(annotation: Annotation) =&gt; void</span>
            </div>
            <p class="prop-desc">{{ t('api.annotationDeleteDesc') }}</p>
          </div>
          <div class="prop-item">
            <div class="prop-header">
              <code class="prop-name">@annotation-update</code>
              <span class="prop-type">(annotation: Annotation) =&gt; void</span>
            </div>
            <p class="prop-desc">{{ t('api.annotationUpdateDesc') }}</p>
          </div>
          <div class="prop-item">
            <div class="prop-header">
              <code class="prop-name">@annotations-clear</code>
              <span class="prop-type">(annotations: Annotation[]) =&gt; void</span>
            </div>
            <p class="prop-desc">{{ t('api.annotationsClearDesc') }}</p>
          </div>
          <div class="prop-item">
            <div class="prop-header">
              <code class="prop-name">@copy</code>
              <span class="prop-type">(markdown: string) =&gt; void</span>
            </div>
            <p class="prop-desc">{{ t('api.copyDesc') }}</p>
          </div>
          <div class="prop-item">
            <div class="prop-header">
              <code class="prop-name">copy-to-clipboard</code>
              <span class="prop-type">boolean</span>
              <span class="prop-default">default: true</span>
            </div>
            <p class="prop-desc">{{ t('api.copyToClipboardDesc') }}</p>
          </div>
        </div>
      </section>

      <section>
        <h2>{{ t('api.basicUsage') }}</h2>
        <p>
          {{ t('api.basicUsageDesc') }}
        </p>
        <pre class="code-block">&lt;script setup lang="ts"&gt;
import { Agentation, type Annotation } from "agentation-vue3";

const handleAnnotation = (annotation: Annotation) =&gt; {
  console.log(annotation.element, annotation.comment);
};
&lt;/script&gt;

&lt;template&gt;
  &lt;YourApp /&gt;
  &lt;Agentation @annotation-add="handleAnnotation" /&gt;
&lt;/template&gt;</pre>
      </section>

      <section>
        <h2>{{ t('api.annotationType') }}</h2>
        <p>
          {{ t('api.annotationTypeDesc') }}<code>Annotation</code> {{ t('api.annotationTypeDesc2') }}
        </p>
        <pre class="code-block">type Annotation = {
  id: string;              // Unique identifier
  element: string;         // Human-readable element name
  elementPath: string;     // CSS selector path
  comment: string;         // User's annotation text
  timestamp: number;       // Unix timestamp
  x: number;               // Position (% of viewport width)
  y: number;               // Position (px from top, or viewport if fixed)
  selectedText?: string;   // If text was selected
  boundingBox?: {          // Element dimensions
    x: number;
    y: number;
    width: number;
    height: number;
  };
  // Additional fields (Detailed/Forensic modes)
  nearbyText?: string;
  cssClasses?: string;
  nearbyElements?: string;
  computedStyles?: string;
  fullPath?: string;
  accessibility?: string;
  isMultiSelect?: boolean;
  isFixed?: boolean;
};</pre>
      </section>

      <section>
        <h2>{{ t('api.typescript') }}</h2>
        <p>
          {{ t('api.typescriptDesc') }}
        </p>
        <pre class="code-block">import type { Annotation, AgentationProps } from "agentation-vue3";</pre>
      </section>
    </article>

    <Footer />
  </div>
</template>

<style scoped>
.props-list {
  display: flex;
  flex-direction: column;
}
.prop-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.prop-item:last-child {
  border-bottom: none;
}
.prop-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.prop-name {
  font-size: 0.8125rem;
  font-family: "SF Mono", "SFMono-Regular", ui-monospace, Consolas, monospace;
  color: rgba(0, 0, 0, 0.8);
}
.prop-type {
  font-size: 0.75rem;
  font-family: "SF Mono", "SFMono-Regular", ui-monospace, Consolas, monospace;
  color: rgba(0, 0, 0, 0.4);
}
.prop-default {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.4);
}
.prop-desc {
  font-size: 0.8125rem;
  font-weight: 450;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.55);
  margin: 0;
}
</style>
