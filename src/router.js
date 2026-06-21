import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Stats from './views/Stats.vue'
import Matches from './views/Matches.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router