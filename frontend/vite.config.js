import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Endereço do backend. Por omissão a API corre em http://127.0.0.1:8000
  // (127.0.0.1 e não "localhost": no Windows "localhost" tenta IPv6 primeiro e atrasa cada pedido).
  // Para usar o Nginx do Docker, crie frontend/.env.local com:
  //   BOOKIT_API=http://localhost:8080
  const env = loadEnv(mode, process.cwd(), '')
  const alvo = env.BOOKIT_API || 'http://127.0.0.1:8000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: alvo, changeOrigin: true },
      },
    },
  }
})
