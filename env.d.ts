/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_COMING_SOON_BANKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
