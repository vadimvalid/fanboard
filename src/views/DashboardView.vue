<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useTeamStore } from '@/stores/team'
import { getMatchResult, formatMatchDate } from '@/utils/match'
import type { MatchStatus } from '@/types/football'

const props = defineProps<{
  teamId: number
}>()

const store = useTeamStore()
const UPCOMING_STATUSES: MatchStatus[] = ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED']

const {
  data: matches,
  isLoading: matchesLoading,
  error: matchesError,
} = useAsyncData(() => store.fetchTeamMatches(props.teamId))

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

const lastMatch = computed(() => {
  return finishedMatches.value.at(-1) ?? null
})

const nextMatch = computed(() => {
  return upcomingMatches.value[0] ?? null
})

const form = computed(() => {
  return finishedMatches.value?.slice(-5)
})
</script>

<template>
  <section aria-labelledby="dashboard-title">
    <h3 id="dashboard-title" class="sr-only">Обзор команды</h3>

    <p v-if="matchesLoading" class="text-slate-500">Загрузка матчей…</p>
    <p v-else-if="matchesError" role="alert" class="text-red-700">{{ matchesError.message }}</p>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <article class="rounded-xl border border-slate-200 bg-white p-5">
        <h4 class="text-sm font-medium text-slate-500">
          {{
            nextMatch?.status === 'IN_PLAY' || nextMatch?.status === 'PAUSED'
              ? 'Идёт матч'
              : 'Ближайший матч'
          }}
        </h4>
        <template v-if="nextMatch">
          <p class="mt-1 text-xs text-slate-500">
            {{ nextMatch.competition.name }} · {{ formatMatchDate(nextMatch.utcDate) }}
          </p>
          <div class="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
            <div class="flex flex-col items-center gap-2">
              <img
                v-if="nextMatch.homeTeam.crest"
                :src="nextMatch.homeTeam.crest"
                alt=""
                class="size-12 object-contain"
              />
              <span class="text-sm font-medium">{{ nextMatch.homeTeam.shortName }}</span>
            </div>
            <span class="text-slate-400">—</span>
            <div class="flex flex-col items-center gap-2">
              <img
                v-if="nextMatch.awayTeam.crest"
                :src="nextMatch.awayTeam.crest"
                alt=""
                class="size-12 object-contain"
              />
              <span class="text-sm font-medium">{{ nextMatch.awayTeam.shortName }}</span>
            </div>
          </div>
        </template>
        <p v-else class="mt-4 text-slate-500">Предстоящих матчей нет</p>
      </article>

      <article class="rounded-xl border border-slate-200 bg-white p-5">
        <h4 class="text-sm font-medium text-slate-500">Последний результат</h4>
        <template v-if="lastMatch">
          <p class="mt-1 text-xs text-slate-500">
            {{ lastMatch.competition.name }} · {{ formatMatchDate(lastMatch.utcDate) }}
          </p>
          <div class="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
            <div class="flex flex-col items-center gap-2">
              <img
                v-if="lastMatch.homeTeam.crest"
                :src="lastMatch.homeTeam.crest"
                alt=""
                class="size-12 object-contain"
              />
              <span class="text-sm font-medium">{{ lastMatch.homeTeam.shortName }}</span>
            </div>
            <span
              class="rounded-lg px-3 py-1 text-2xl font-bold tabular-nums"
              :class="{
                'bg-emerald-100 text-emerald-800': getMatchResult(lastMatch, teamId) === 'W',
                'bg-slate-100 text-slate-700': getMatchResult(lastMatch, teamId) === 'D',
                'bg-red-100 text-red-800': getMatchResult(lastMatch, teamId) === 'L',
              }"
            >
              {{ lastMatch.score.fullTime.home ?? '–' }} :
              {{ lastMatch.score.fullTime.away ?? '–' }}
            </span>
            <div class="flex flex-col items-center gap-2">
              <img
                v-if="lastMatch.awayTeam.crest"
                :src="lastMatch.awayTeam.crest"
                alt=""
                class="size-12 object-contain"
              />
              <span class="text-sm font-medium">{{ lastMatch.awayTeam.shortName }}</span>
            </div>
          </div>
        </template>
        <p v-else class="mt-4 text-slate-500">Сыгранных матчей пока нет</p>
      </article>

      <article class="rounded-xl border border-slate-200 bg-white p-5 md:col-span-2">
        <h4 class="text-sm font-medium text-slate-500">Форма — последние {{ form.length }} игр</h4>
        <ol v-if="form.length" class="mt-4 flex gap-2">
          <li v-for="match in form" :key="match.id">
            <span
              class="flex size-10 items-center justify-center rounded-full text-sm font-bold"
              :class="{
                'bg-emerald-600 text-white': getMatchResult(match, teamId) === 'W',
                'bg-slate-400 text-white': getMatchResult(match, teamId) === 'D',
                'bg-red-600 text-white': getMatchResult(match, teamId) === 'L',
                'bg-slate-100 text-slate-500': getMatchResult(match, teamId) === null,
              }"
              :title="`${match.homeTeam.shortName} ${match.score.fullTime.home ?? '–'}:${match.score.fullTime.away ?? '–'} ${match.awayTeam.shortName}`"
            >
              <template v-if="getMatchResult(match, teamId) === 'W'">
                <span aria-hidden="true">В</span><span class="sr-only">Победа:</span>
              </template>
              <template v-else-if="getMatchResult(match, teamId) === 'D'">
                <span aria-hidden="true">Н</span><span class="sr-only">Ничья:</span>
              </template>
              <template v-else-if="getMatchResult(match, teamId) === 'L'">
                <span aria-hidden="true">П</span><span class="sr-only">Поражение:</span>
              </template>
              <template v-else>
                <span aria-hidden="true">—</span><span class="sr-only">Нет результата:</span>
              </template>
              <span class="sr-only">
                {{ match.homeTeam.shortName }} {{ match.score.fullTime.home ?? '–' }}:{{
                  match.score.fullTime.away ?? '–'
                }}
                {{ match.awayTeam.shortName }}
              </span>
            </span>
          </li>
        </ol>
        <p v-else class="mt-4 text-slate-500">Сыгранных матчей пока нет</p>
      </article>
    </div>
  </section>
</template>
