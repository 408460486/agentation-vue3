<script setup lang="ts">
import CodeBlock from '~/components/CodeBlock.vue'

const basicUsageCode = `<script setup lang="ts">
import { Agentation, type Annotation } from "agentation-vue3";

const handleAnnotation = (annotation: Annotation) => {
  console.log(annotation.element, annotation.comment);
};
<\/script>

<template>
  <YourApp />
  <Agentation @annotation-add="handleAnnotation" />
</template>`

const annotationTypeCode = `type Annotation = {
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
};`

const typescriptCode = `import type { Annotation, AgentationProps } from "agentation-vue3";`
</script>

<template>
  <div>
    <article class="article">
      <header>
        <h1>API</h1>
        <p class="tagline">Programmatic access for developers</p>
      </header>

      <section>
        <h2>Overview</h2>
        <p>
          Agentation exposes callbacks that let you integrate annotations into
          your own workflows — send to a backend, pipe to terminal, trigger
          automations, or build custom AI integrations.
        </p>
        <ul>
          <li>Sync annotations to a database or backend service</li>
          <li>Build analytics dashboards tracking feedback patterns</li>
          <li>Create custom AI integrations (MCP servers, agent tools)</li>
          <li>Trigger webhooks or Slack notifications on new feedback</li>
        </ul>
      </section>

      <section>
        <h2>Props &amp; Events</h2>
        <div class="props-list">
          <div class="prop-item">
            <div class="prop-header">
              <code class="prop-name">@annotation-add</code>
              <span class="prop-type">(annotation: Annotation) =&gt; void</span>
            </div>
            <p class="prop-desc">Called when an annotation is created</p>
          </div>
          <div class="prop-item">
            <div class="prop-header">
              <code class="prop-name">@annotation-delete</code>
              <span class="prop-type">(annotation: Annotation) =&gt; void</span>
            </div>
            <p class="prop-desc">Called when an annotation is deleted</p>
          </div>
          <div class="prop-item">
            <div class="prop-header">
              <code class="prop-name">@annotation-update</code>
              <span class="prop-type">(annotation: Annotation) =&gt; void</span>
            </div>
            <p class="prop-desc">Called when an annotation comment is edited</p>
          </div>
          <div class="prop-item">
            <div class="prop-header">
              <code class="prop-name">@annotations-clear</code>
              <span class="prop-type">(annotations: Annotation[]) =&gt; void</span>
            </div>
            <p class="prop-desc">Called when all annotations are cleared</p>
          </div>
          <div class="prop-item">
            <div class="prop-header">
              <code class="prop-name">@copy</code>
              <span class="prop-type">(markdown: string) =&gt; void</span>
            </div>
            <p class="prop-desc">Callback with the markdown output when copy is clicked</p>
          </div>
          <div class="prop-item">
            <div class="prop-header">
              <code class="prop-name">copy-to-clipboard</code>
              <span class="prop-type">boolean</span>
              <span class="prop-default">default: true</span>
            </div>
            <p class="prop-desc">Set to false to prevent writing to clipboard (if handling via @copy)</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Basic usage</h2>
        <p>
          Receive annotation data directly in your code:
        </p>
        <CodeBlock :code="basicUsageCode" language="typescript" />
      </section>

      <section>
        <h2>Annotation type</h2>
        <p>
          The <code>Annotation</code> object passed to callbacks:
        </p>
        <CodeBlock :code="annotationTypeCode" language="typescript" />
      </section>

      <section>
        <h2>TypeScript</h2>
        <p>
          Types are exported for full TypeScript support:
        </p>
        <CodeBlock :code="typescriptCode" language="typescript" />
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