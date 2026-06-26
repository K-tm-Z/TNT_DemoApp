import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Must match the GitHub repo name for project pages: https://<user>.github.io/<repo>/
  base: '/TNT_DemoApp/',
  plugins: [react()],
})
