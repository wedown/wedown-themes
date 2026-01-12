import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import vitePluginThemes from './scripts/vite-plugin-themes.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), vitePluginThemes()],
})
