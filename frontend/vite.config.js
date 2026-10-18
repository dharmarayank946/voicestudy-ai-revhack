import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // Use '/' on Vercel or local development; use '/voicestudy-ai-revhack/' only on GitHub Pages actions
  const isGitHubPages = Boolean(process.env.GITHUB_ACTIONS && !process.env.VERCEL);
  const basePath = process.env.VITE_BASE_PATH || (isGitHubPages ? '/voicestudy-ai-revhack/' : '/');

  return {
    plugins: [react()],
    base: command === 'serve' ? '/' : basePath,
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
