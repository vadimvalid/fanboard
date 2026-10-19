<script setup lang="ts">
import { useAsyncData } from '@/composables/useAsyncData'
import { useTeamStore } from '@/stores/team'

const props = defineProps<{
  teamId: number
}>()

const store = useTeamStore()

const {
  data: team,
  isLoading: teamLoading,
  error: teamError,
} = useAsyncData(() => store.fetchTeam(props.teamId))
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between gap-4">
      <div v-if="teamLoading" class="flex items-center gap-4" aria-busy="true">
        <div class="size-16 animate-pulse rounded-full bg-slate-200"></div>
        <div class="h-7 w-48 animate-pulse rounded bg-slate-200"></div>
      </div>
      <p v-else-if="teamError" role="alert" class="text-red-700">{{ teamError.message }}</p>
      <div v-else-if="team" class="flex min-w-0 items-center gap-4">
        <img
          v-if="team.crest"
          :src="team.crest"
          :alt="`Эмблема ${team.name}`"
          class="size-16 shrink-0 object-contain"
        />
        <div class="min-w-0">
          <h2 class="truncate text-2xl font-bold">{{ team.name }}</h2>
          <p v-if="team.venue" class="truncate text-sm text-slate-500">{{ team.venue }}</p>
        </div>
      </div>

      <RouterLink
        :to="{ name: 'select-team' }"
        class="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-slate-400"
      >
        Сменить команду
      </RouterLink>
    </div>

    <nav aria-label="Разделы команды" class="border-b border-slate-200">
      <ul class="-mb-px flex gap-1 overflow-x-auto">
        <li
          v-for="tab in [
            { name: 'dashboard', label: 'Обзор' },
            { name: 'matches', label: 'Матчи' },
            { name: 'standings', label: 'Таблица' },
            { name: 'squad', label: 'Состав' },
          ]"
          :key="tab.name"
        >
          <RouterLink
            :to="{ name: tab.name, params: { id: teamId } }"
            class="block border-b-2 border-transparent px-4 py-2 text-sm font-medium whitespace-nowrap text-slate-600 hover:text-slate-900"
            exact-active-class="border-emerald-600! text-emerald-700!"
          >
            {{ tab.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="pt-6">
      <RouterView />
    </div>
  </div>
</template>
