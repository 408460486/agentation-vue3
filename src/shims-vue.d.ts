// Vue SFC type declarations
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// CSS Modules type declaration for $style
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $style: Record<string, string>
  }
}

export {}
