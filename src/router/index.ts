import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/',
    component: () => import('../layout/Layout.vue'),
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
      },
      {
        path: 'member',
        name: 'member',
        component: () => import('../views/MemberListView.vue'),
      },
      {
        path: 'activity',
        name: 'activity',
        component: () => import('../views/ActivityListView.vue'),
      },
      {
        path: 'member/:id',
        name: 'member-detail',
        component: () => import('../views/MemberDetailView.vue'),
        props: true
      },
      {
        path: 'activity/:id',
        name: 'activity-detail',
        component: () => import('../views/ActivityDetailView.vue'),
        props: true
      },
      {
        path: 'activity-edit/:id?',
        name: 'activity-edit',
        component: () => import('../views/ActivityEditView.vue'),
        props: true
      }
    ],
  },
]

// 添加路由前缀 '/admin'
const router = createRouter({
  history: createWebHistory('/admin'),
  routes,
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  // 如果访问的不是登录页，且未登录，则重定向到登录页
  if (to.path !== '/login' && !isLoggedIn) {
    next('/login')
  } else {
    // 如果已登录且访问登录页，则重定向到首页
    if (to.path === '/login' && isLoggedIn) {
      next('/')
    } else {
      next()
    }
  }
})

export default router
