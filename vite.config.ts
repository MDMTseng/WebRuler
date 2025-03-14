import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dependencies } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    cssCodeSplit: true,
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const packageName = id.toString().split('node_modules/')[1].split('/')[0];
            
            // Only process packages from dependencies
            if (Object.keys(dependencies).includes(packageName)) {
              // React related packages
              if (packageName === 'react' || packageName === 'react-dom') {
                return 'react-vendor';
              }
              
              // All other dependencies from package.json
              return 'vendor';
            }
          }
        },
      },
    },
  },
}) 