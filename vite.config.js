import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path"


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server:{
    hmr: true,
    port: 3001,
    proxy:{
      '/api': {
        target: "http://localhost:8085/", // target hosting port address
        secure: false,
        changeOrigin: true, // start proxy, creating a local proxy server
        pathRewrite: {
          '^api': '/api',
        },
      },
    },
  },

  configWebpack: {
    devtool: 'source-map'
  },
  resolve: {
    //config path alias
    alias:[{

      '@': path.resolve(__dirname, './src'),
      find: /^~(.*)$/,
      replacement: 'node_modules/$1',
    }]
  },


  
})
