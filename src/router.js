import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Stats from './views/Stats.vue'
import Matches from './views/Matches.vue'
import Login from './views/Login.vue'
import Admin from './views/Admin.vue'
import { useAdminAuth } from './composables/useAdminAuth.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats
  },
  {
    path: '/matches',
    name: 'Matches',
    component: Matches
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !useAdminAuth().isAuthenticated()) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})

export default router
