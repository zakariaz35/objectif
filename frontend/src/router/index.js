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
  { path: '/reviser', name: 'review', component: () => import('../views/ReviewView.vue') },
  { path: '/tableau-de-bord', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/explorer', name: 'explorer', component: () => import('../views/ExplorerView.vue') },
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
  // Atelier : construire/éditer les itinéraires (roadmaps).
  {
    path: '/atelier-parcours/:slug?',
    name: 'atelier-parcours',
    component: () => import('../views/AtelierParcoursView.vue'),
    props: true,
  },
  // Plan de carrière 6 mois : cockpit (jalons, semaine, revue, études) + tracker.
  { path: '/plan', name: 'plan', component: () => import('../views/PlanView.vue') },
  { path: '/candidatures', name: 'candidatures', component: () => import('../views/CandidaturesView.vue') },
  // Rapport lisible/copiable de GET /api/suivi/etat (pour le coach IA).
  { path: '/suivi/etat', name: 'etat', component: () => import('../views/EtatView.vue') },
  {
    path: '/f/:formation',
    component: FormationView,
    props: true,
    children: [
      {
        path: 'resultats',
        name: 'results',
        component: () => import('../views/ResultsView.vue'),
      },
      {
        path: ':module/:lesson',
        name: 'lesson',
        component: LessonView,
        props: true,
      },
    ],
  },
  // Filet : toute URL inconnue ramène à l'accueil (jamais de page blanche).
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
