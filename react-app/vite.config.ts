import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Cơm Ánh Dương',
        short_name: 'Cơm Ánh Dương',
        description: 'Ứng dụng đặt cơm trưa văn phòng, quản lý đơn hàng và giao hàng nhanh chóng.',
        theme_color: '#4ade80',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@mui/material') || id.includes('@mui/system')) {
              return 'vendor-mui-core';
            }
            if (id.includes('@mui/icons-material')) {
              return 'vendor-mui-icons';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('zustand')) {
              return 'vendor-state';
            }
            // Other vendors
            return 'vendor-misc';
          }

          // Feature chunks
          if (id.includes('/features/admin/')) {
            return 'features-admin';
          }
          if (id.includes('/features/analytics/')) {
            return 'features-analytics';
          }
          if (id.includes('/pages/admin/')) {
            return 'pages-admin';
          }
          if (id.includes('/pages/kitchen/') || id.includes('/features/kds/')) {
            return 'features-kitchen';
          }
          if (id.includes('/pages/staff/') || id.includes('/features/pos/')) {
            return 'features-pos';
          }
          if (id.includes('/pages/shipper/') || id.includes('/features/delivery/')) {
            return 'features-delivery';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
