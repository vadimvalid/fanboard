import { type MaybeRefOrGetter, toValue, computed } from 'vue'
import { useTeamStore } from '@/stores/team'
import { useAsyncData } from '@/composables/useAsyncData'

export function useTeamStandings(teamId: MaybeRefOrGetter<number>) {
  const store = useTeamStore()

  const { data, isLoading, error } = useAsyncData(async () => {
    const team = await store.fetchTeam(toValue(teamId))
    const league = team.runningCompetitions.find((competition) => competition.type === 'LEAGUE')

    if (!league) {
      return { competition: null, table: [] }
    }

    return {
      competition: league,
      table: await store.fetchStandings(league.code),
    }
  })

  const competition = computed(() => data.value?.competition ?? null)
  const table = computed(() => data.value?.table ?? [])

  return { isLoading, error, competition, table }
}
