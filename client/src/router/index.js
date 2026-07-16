import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '../layouts/PublicLayout.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ═══ ZONE 1: public ═══════════════════════════════════════
    {
      path: '/',
      component: PublicLayout,          // eager: every visitor needs it
      children: [
        {
          path: '',                     // default child → matches "/"
          name: 'home',
          component: HomeView,          // eager: landing page, no delay
          meta: { fullHeight: true, title: 'Home' },
        },
        {
          path: 'contact',              // no leading slash!
          name: 'contact',
          component: () => import('../views/ContactView.vue'),
          meta: { fullHeight: true, title: 'Contact' },
        },

        // project detail — one component, N projects
        {
          path: 'work/:slug',
          name: 'project',
          component: () => import('../views/ProjectView.vue'),
          meta: { fullHeight: false, title: 'Work' },
        },

        // 404 page
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: () => import('../views/NotFoundView.vue'),
          meta: { fullHeight: true, title: 'Not found' },
        },
      ],
    },

    // ═══ ZONE 2: admin ════════════════════════════════════════
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'), // lazy zone
      meta: { requiresAuth: true },     // inherited by every child below
      children: [
        {
          path: '',                     // default child → matches "/admin"
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue'),
          meta: { title: 'Dashboard' },
        },
        {
          path: 'users',                // → matches "/admin/users"
          name: 'admin-users',
          component: () => import('../views/admin/UsersView.vue'),
          meta: { title: 'Users' },
        },
      ],
    },
  ],
})

// One guard protects the whole admin zone (meta inherited from parent)
router.beforeEach((to) => {
  const isLoggedIn = true   // TODO: replace with real auth check
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'home' } // or a future { name: 'login' }
  }
})

// Bonus from the PDF (p. 29): page titles from meta
router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} · madebyjoao`
    : 'madebyjoao'
})

export default router