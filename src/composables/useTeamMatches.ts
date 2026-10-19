import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useTeamStore } from '@/stores/team'
import { useAsyncData } from '@/composables/useAsyncData'
import type { MatchStatus } from '@/types/football'

const UPCOMING_STATUSES: MatchStatus[] = ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED']

export function useTeamMatches(teamId: MaybeRefOrGetter<number>) {
  const store = useTeamStore()

  const {
    data: matches,
    isLoading,
    error,
  } = useAsyncData(() => store.fetchTeamMatches(toValue(teamId)))

  const finishedMatches = computed(() => {
    return (
      matches.value
        ?.filter((match) => match.status === 'FINISHED')
        .sort((a, b) => a.utcDate.localeCompare(b.utcDate)) ?? []
    )
  })

  const upcomingMatches = computed(() => {
    return (
      matches.value
        ?.filter((match) => UPCOMING_STATUSES.includes(match.status))
        .sort((a, b) => a.utcDate.localeCompare(b.utcDate)) ?? []
    )
  })

  return { matches, isLoading, error, finishedMatches, upcomingMatches }
}
