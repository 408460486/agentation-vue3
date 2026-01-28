---
name: agentation
description: Add Agentation visual feedback toolbar to a Vue 3/Nuxt 3 project
---

# Agentation Setup (Vue 3)

Set up the Agentation annotation toolbar in this Vue 3 or Nuxt 3 project.

## Steps

1. **Check if already installed**
   - Look for `agentation-vue3` in package.json dependencies
   - If not found, run `npm install agentation-vue3` (or pnpm/yarn based on lockfile)

2. **Check if already configured**
   - Search for `<Agentation` or `import { Agentation }` in src/ or components/
   - If found, report that Agentation is already set up and exit

3. **Detect framework**
   - Nuxt 3: has `nuxt.config.ts` or `nuxt.config.js`
   - Vue 3 + Vite: has `vite.config.ts` and `src/App.vue`
   - Vue 3 + Vue CLI: has `vue.config.js`

4. **Add the component**

   For Nuxt 3, create a client-only plugin or add to app.vue:
   ```vue
   <script setup>
   import { Agentation } from "agentation-vue3";
   import "agentation-vue3/dist/style.css";
   </script>

   <template>
     <div>
       <NuxtPage />
       <Agentation v-if="$config.public.dev" />
     </div>
   </template>
   ```

   Or create `plugins/agentation.client.ts`:
   ```ts
   import { Agentation } from "agentation-vue3";
   import "agentation-vue3/dist/style.css";

   export default defineNuxtPlugin((nuxtApp) => {
     nuxtApp.vueApp.component("Agentation", Agentation);
   });
   ```

   For Vue 3 + Vite, add to App.vue or main.ts:
   ```vue
   <script setup>
   import { Agentation } from "agentation-vue3";
   import "agentation-vue3/dist/style.css";
   </script>

   <template>
     <router-view />
     <Agentation v-if="import.meta.env.DEV" />
   </template>
   ```

5. **Confirm setup**
   - Tell the user to run their dev server and look for the Agentation toolbar (floating button in bottom-center)

## Notes

- The dev check ensures Agentation only loads in development
- Agentation requires Vue 3.3+
- No additional configuration needed — it works out of the box
- Remember to import the CSS: `import "agentation-vue3/dist/style.css"`
