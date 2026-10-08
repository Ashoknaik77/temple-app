import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Project Pages URL: https://ashoknaik77.github.io/temple-app/
  base: '/temple-app/',
})
