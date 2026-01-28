import { configureVueProject, defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginOxlint from 'eslint-plugin-oxlint'

configureVueProject({
  rootDir: import.meta.dirname,
})

export default defineConfigWithVueTs(
  // @ts-ignore - Type compatibility varies between environments
  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    ...pluginPlaywright.configs['flat/recommended'],
  },

  {
    files: ['src/**/__tests__/*'],
    ...pluginVitest.configs.recommended,
  },

  skipFormatting,

  ...pluginOxlint.configs['flat/recommended'],

  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
)
