import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FormationView from '../views/FormationView.vue'
import LessonView from '../views/LessonView.vue'
import AuthView from '../views/AuthView.vue'
// ⚠️ DEBUG / personal use only — remove if the project is no longer personal.
import AccountsView from '../views/AccountsView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/auth', name: 'auth', component: AuthView },
  // ⚠️ DEBUG / personal use only — accounts list. Remove if not personal.
  { path: '/comptes', name: 'accounts', component: AccountsView },
  // ⚠️ TEMPORARY — logo comparator. Remove once the logo is chosen.
  { path: '/logos', name: 'logos', component: () => import('../views/LogosView.vue') },
  {
    path: '/parcours/:slug',
    name: 'parcours',
    component: () => import('../views/ParcoursView.vue'),
    props: true,
  },
  {
    path: '/f/:formation',
    component: FormationView,
    props: true,
    children: [
      {
        path: ':module/:lesson',
        name: 'lesson',
        component: LessonView,
        props: true,
      },
    ],
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
