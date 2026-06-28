import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FormationView from '../views/FormationView.vue'
import LessonView from '../views/LessonView.vue'
import AuthView from '../views/AuthView.vue'
// ⚠️ DEBUG / perso uniquement — à retirer si le projet n'est plus personnel.
import AccountsView from '../views/AccountsView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/auth', name: 'auth', component: AuthView },
  // ⚠️ DEBUG / perso uniquement — liste des comptes. À retirer si non-perso.
  { path: '/comptes', name: 'accounts', component: AccountsView },
  // ⚠️ TEMPORAIRE — comparateur de logos. À retirer une fois le logo choisi.
  { path: '/logos', name: 'logos', component: () => import('../views/LogosView.vue') },
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
