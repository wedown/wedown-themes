import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import vitePluginThemes from './scripts/vite-plugin-themes.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginThemes()],
})
