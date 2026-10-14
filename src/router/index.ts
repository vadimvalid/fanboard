import { createRouter, createWebHistory } from 'vue-router'
import { useTeamStore } from '@/stores/team'
import type { RouteLocationNormalized } from 'vue-router'

const teamIdProps = (route: RouteLocationNormalized) => ({ teamId: Number(route.params.id) })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {
        const teamStore = useTeamStore()
        if (teamStore.selectedTeamId) {
          return { name: 'dashboard', params: { id: teamStore.selectedTeamId } }
        }
        return { name: 'select-team' }
      },
    },
    {
      path: '/select-team',
      name: 'select-team',
      component: () => import('@/views/SelectTeamView.vue'),
    },
    {
      path: '/team/:id(\\d+)',
      component: () => import('@/views/TeamLayout.vue'),
      props: teamIdProps,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          props: teamIdProps,
        },
        {
          path: 'matches',
          name: 'matches',
          component: () => import('@/views/MatchesView.vue'),
          props: teamIdProps,
        },
        {
          path: 'squad',
          name: 'squad',
          component: () => import('@/views/SquadView.vue'),
          props: teamIdProps,
        },
        {
          path: 'standings',
          name: 'standings',
          component: () => import('@/views/StandingsView.vue'),
          props: teamIdProps,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/',
    },
  ],
})

export default router
