<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '@/composables/useAsyncData'
import type { PlayerPosition } from '@/types/football'
import { useTeamStore } from '@/stores/team'
import { getAge } from '@/utils/player'

const POSITION_ORDER: PlayerPosition[] = ['Goalkeeper', 'Defence', 'Midfield', 'Offence']
const POSITION_LABELS: Record<PlayerPosition, string> = {
  Goalkeeper: 'Вратари',
  Defence: 'Защита',
  Midfield: 'Полузащита',
  Offence: 'Нападение',
}

const props = defineProps<{
  teamId: number
}>()

const store = useTeamStore()

const {
  data: team,
  isLoading: teamLoading,
  error: teamError,
} = useAsyncData(() => store.fetchTeam(props.teamId))

const squadGroups = computed(() => {
  return POSITION_ORDER.map((position) => {
    return {
      position,
      label: POSITION_LABELS[position],
      players:
        team.value?.squad
          .filter((player) => player.position === position)
          .sort((a, b) => a.name.localeCompare(b.name)) ?? [],
    }
  }).filter((group) => group.players.length > 0)
})
</script>

<template>
  <section aria-labelledby="squad-title" class="space-y-6">
    <h3 id="squad-title" class="sr-only">Состав команды</h3>

    <p v-if="teamLoading" class="text-slate-500">Загрузка состава…</p>
    <p v-else-if="teamError" role="alert" class="text-red-700">{{ teamError.message }}</p>

    <template v-else-if="team">
      <div
        v-if="team.coach?.name"
        class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4"
      >
        <span class="text-sm text-slate-500">Главный тренер</span>
        <span class="font-semibold">{{ team.coach.name }}</span>
      </div>

      <p v-if="squadGroups.length === 0" class="text-slate-500">Состав пока не опубликован.</p>

      <template v-for="group in squadGroups" :key="group.position">
        <section :aria-labelledby="`group-${group.position}`" class="space-y-2">
          <h4
            :id="`group-${group.position}`"
            class="flex items-baseline gap-2 text-lg font-semibold"
          >
            {{ group.label }}
            <span class="text-sm font-normal text-slate-500 tabular-nums">
              {{ group.players.length }}
            </span>
          </h4>
          <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="player in group.players"
              :key="player.id"
              class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <span class="min-w-0">
                <span class="block truncate font-medium">{{ player.name }}</span>
                <span v-if="player.nationality" class="block text-sm text-slate-500">
                  {{ player.nationality }}
                </span>
              </span>
              <span
                v-if="getAge(player.dateOfBirth) !== null"
                class="shrink-0 text-right text-slate-500"
              >
                <span class="block text-xs">возраст</span>
                <span class="block font-medium text-slate-700 tabular-nums">{{
                  getAge(player.dateOfBirth)
                }}</span>
              </span>
            </li>
          </ul>
        </section>
      </template>
    </template>
  </section>
</template>
