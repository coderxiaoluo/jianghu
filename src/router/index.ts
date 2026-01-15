import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home/Home.vue'),
      meta: {
        title: '首页'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/404.vue'),
      meta: {
        title: '页面不存在'
      }
    }
  ]
})

// 路由守卫，设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || '江湖武侠'
  next()
})

export default router