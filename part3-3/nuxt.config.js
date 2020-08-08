module.exports = {
  router: {
    linkActiveClass: 'active',
    // 自定义路由表规则
    extendRoutes (routes, resolve) {
      // 清空默认路由规则
      routes.splice(0)

      routes.push(...[
        {
          path: '/',
          component: resolve(__dirname, 'pages/layout'),
          children: [
            {
              path: '',// 默认子路由
              name: 'home',
              component: resolve(__dirname, 'pages/home')
            },
            {
              path: '/login',// 默认子路由
              name: 'login',
              component: resolve(__dirname, 'pages/login')
            },
            {
              path: '/register',// 默认子路由
              name: 'register',
              component: resolve(__dirname, 'pages/login')
            },
            {
              path: '/profile/:username',// 默认子路由
              name: 'profile',
              component: resolve(__dirname, 'pages/profile')
            },
            {
              path: '/settings',// 默认子路由
              name: 'settings',
              component: resolve(__dirname, 'pages/settings')
            },
            {
              path: '/editor',// 默认子路由
              name: 'editor',
              component: resolve(__dirname, 'pages/editor')
            },
            {
              path: '/article/:slug',// 默认子路由
              name: 'article',
              component: resolve(__dirname, 'pages/article')
            },
          ]
        }
      ])
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  // 注册插件
  plugins: [
    '~/plugins/request.js',
    '~/plugins/dayjs.js'
  ]
}