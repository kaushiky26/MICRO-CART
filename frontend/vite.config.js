import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const productTarget = env.PRODUCT_SERVICE_URL || 'http://localhost:5001';
  const orderTarget = env.ORDER_SERVICE_URL || 'http://localhost:5002';

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: Number(env.PORT) || 5173,
      strictPort: false,

      allowedHosts: true,
      proxy: {
        '/product-api': {
          target: productTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/product-api/, '')
        },
        '/order-api': {
          target: orderTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/order-api/, '')
        }
      }
    }
  };
});
