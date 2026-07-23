import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '../layouts/PublicLayout.vue'
import HomeView from '../views/HomeView.vue'
import { isLoggedIn } from '@/lib/auth'


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
          meta: { fullHeight: true, snap: true, title: 'Accueil' },
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
		path: '/admin/login',
		name: 'admin-login',
		component: () => import('../views/admin/LoginView.vue'),
		meta: { title: 'Connexion' },
	},
    {
		path: '/admin',
		component: () => import('../layouts/AdminLayout.vue'),
		meta: { requiresAuth: true },
		children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue'),
          meta: { title: 'Dashboard' },
        },
        {
          path: 'demandes/:id',
          name: 'admin-request',
          component: () => import('../views/admin/DashboardView.vue'),
          meta: { title: 'Demande' },
		    },
      ],
    },
  ],
})


router.beforeEach((to) => {

	if (to.meta.requiresAuth && !isLoggedIn.value) {
		return { name: 'admin-login' }
	}

	if (to.name === 'admin-login' && isLoggedIn.value) {
		return { name: 'admin-dashboard' }
	}
})


router.afterEach((to) => {
	document.title = to.meta.title
		? `${to.meta.title} · madebyjoao`
		: 'madebyjoao'
})

export default router