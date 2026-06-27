import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FormationView from '../views/FormationView.vue'
import LessonView from '../views/LessonView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
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
