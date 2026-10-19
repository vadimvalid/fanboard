<script setup lang="ts">
import { computed, ref } from 'vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { useTeamMatches } from '@/composables/useTeamMatches'
import { getMatchResult, formatMatchDate } from '@/utils/match'

const props = defineProps<{
  teamId: number
}>()

const {
  isLoading: matchesLoading,
  error: matchesError,
  finishedMatches,
  upcomingMatches,
} = useTeamMatches(() => props.teamId)

const pastMatches = computed(() => {
  return [...finishedMatches.value].reverse()
})

const activeTab = ref<'upcoming' | 'finished'>('upcoming')
</script>

<template>
  <section aria-labelledby="matches-title">
    <h3 id="matches-title" class="sr-only">Матчи сезона</h3>

    <p v-if="matchesLoading" class="text-slate-500">Загрузка матчей…</p>
    <p v-else-if="matchesError" role="alert" class="text-red-700">{{ matchesError.message }}</p>

    <TabsRoot v-else v-model="activeTab">
      <TabsList
        aria-label="Тип матчей"
        class="inline-flex rounded-lg border border-slate-200 bg-white p-1"
      >
        <TabsTrigger
          v-for="tab in [
            { value: 'upcoming', label: 'Предстоящие', count: upcomingMatches.length },
            { value: 'finished', label: 'Сыгранные', count: pastMatches.length },
          ]"
          :key="tab.value"
          :value="tab.value"
          class="rounded-md px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
        >
          {{ tab.label }}
          <span class="ml-1 tabular-nums opacity-70">{{ tab.count }}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        v-for="tab in [
          { value: 'upcoming', list: upcomingMatches, empty: 'Предстоящих матчей нет' },
          { value: 'finished', list: pastMatches, empty: 'Сыгранных матчей пока нет' },
        ]"
        :key="tab.value"
        :value="tab.value"
        class="mt-4 focus-visible:outline-none"
      >
        <p v-if="tab.list.length === 0" class="text-slate-500">{{ tab.empty }}</p>
        <ul
          v-else
          class="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <li
            v-for="match in tab.list"
            :key="match.id"
            class="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[7rem_1fr_auto]"
          >
            <div class="text-xs text-slate-500">
              <div class="font-medium text-slate-700">{{ formatMatchDate(match.utcDate) }}</div>
              <div class="truncate">{{ match.competition.name }}</div>
            </div>

            <div class="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
              <span
                class="flex min-w-0 items-center justify-end gap-2 text-right"
                :class="{ 'font-semibold': match.homeTeam.id === teamId }"
              >
                <span class="truncate">{{ match.homeTeam.shortName }}</span>
                <img
                  v-if="match.homeTeam.crest"
                  :src="match.homeTeam.crest"
                  alt=""
                  loading="lazy"
                  class="size-6 shrink-0 object-contain"
                />
              </span>
              <span class="min-w-12 text-center font-semibold tabular-nums">
                <template v-if="tab.value === 'finished'">
                  {{ match.score.fullTime.home ?? '–' }}:{{ match.score.fullTime.away ?? '–' }}
                </template>
                <template v-else-if="match.status === 'IN_PLAY' || match.status === 'PAUSED'">
                  <span class="text-red-600">LIVE</span>
                </template>
                <span v-else class="text-slate-400">—</span>
              </span>
              <span
                class="flex min-w-0 items-center gap-2"
                :class="{ 'font-semibold': match.awayTeam.id === teamId }"
              >
                <img
                  v-if="match.awayTeam.crest"
                  :src="match.awayTeam.crest"
                  alt=""
                  loading="lazy"
                  class="size-6 shrink-0 object-contain"
                />
                <span class="truncate">{{ match.awayTeam.shortName }}</span>
              </span>
            </div>

            <span v-if="tab.value === 'finished'" class="w-7">
              <span
                v-if="getMatchResult(match, teamId) === 'W'"
                class="flex size-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white"
                ><span aria-hidden="true">В</span><span class="sr-only">Победа</span></span
              >
              <span
                v-else-if="getMatchResult(match, teamId) === 'D'"
                class="flex size-7 items-center justify-center rounded-full bg-slate-400 text-xs font-bold text-white"
                ><span aria-hidden="true">Н</span><span class="sr-only">Ничья</span></span
              >
              <span
                v-else-if="getMatchResult(match, teamId) === 'L'"
                class="flex size-7 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                ><span aria-hidden="true">П</span><span class="sr-only">Поражение</span></span
              >
            </span>
            <span v-else class="w-7"></span>
          </li>
        </ul>
      </TabsContent>
    </TabsRoot>
  </section>
</template>
