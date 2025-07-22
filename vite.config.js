export default {
    server: {
      proxy: {
        '/api': {
          target: 'https://suitmedia-backend.suitdev.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '/api')
        }
      }
    }
  }