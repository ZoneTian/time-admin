import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({  }) => {

  return {
    plugins: [vue()],
    server: {
      proxy: {
        // 配置代理
        '/admin-api': {
          target: 'https://womenshike.top',
          changeOrigin: true,
          secure: false,
          // 不重写路径，保持原样
          rewrite: (path) => path
        }
      },
      // 解决SPA路由刷新404问题
      historyApiFallback: true
    }
  }
})
