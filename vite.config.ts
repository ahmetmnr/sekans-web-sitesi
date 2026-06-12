import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  // Kök alan adı dağıtımı: varlık URL'leri mutlak (/assets/...) olur ki SPA
  // derin-yol geri dönüşünden (index.html'e rewrite) sonra da çözülsün.
  base: '/',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Yerel geliştirme: PHP'yi  `php -S localhost:8080 -t public_html`  ile çalıştırın.
    // Böylece frontend hem dev hem prod'da aynı göreli '/api' tabanını kullanır.
    proxy: {
      '/api':     { target: 'http://localhost:8080', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
});
