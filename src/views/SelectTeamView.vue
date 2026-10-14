<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/team'
import { useAsyncData } from '@/composables/useAsyncData'

const router = useRouter()
const store = useTeamStore()
const selectedCode = ref<string>('PL')
const search = ref<string>('')

const {
  data: competitions,
  isLoading: competitionsLoading,
  error: competitionsError,
} = useAsyncData(() => store.fetchCompetitions())

const leagues = computed(() => {
  return competitions.value?.filter((competition) => competition.type === 'LEAGUE') ?? []
})

const {
  data: teams,
  isLoading: teamsLoading,
  error: teamsError,
} = useAsyncData(() => store.fetchCompetitionTeams(selectedCode.value))

const filteredTeams = computed(() => {
  if (!teams.value) return []

  const query = search.value.trim().toLowerCase()

  return teams.value
    .filter((team) =>
      [team.name, team.shortName, team.tla].some((field) => field.toLowerCase().includes(query)),
    )
    .sort((a, b) => a.name.localeCompare(b.name))
})

const chooseTeam = (id: number) => {
  store.selectTeam(id)
  router.push({ name: 'dashboard', params: { id } })
}
</script>

<template>
  <section class="space-y-6">
    <h2 class="text-2xl font-semibold">Выберите команду</h2>

    <div>
      <h3 class="mb-2 text-sm font-medium text-slate-500">Лига</h3>
      <p v-if="competitionsLoading" class="text-slate-500">Загрузка лиг…</p>
      <p v-else-if="competitionsError" role="alert" class="text-red-700">
        {{ competitionsError.message }}
      </p>
      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="league in leagues"
          :key="league.code"
          type="button"
          :aria-pressed="league.code === selectedCode"
          class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
          :class="
            league.code === selectedCode
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
          "
          @click="selectedCode = league.code"
        >
          <img
            v-if="league.emblem"
            :src="league.emblem"
            alt=""
            class="size-5 rounded-full bg-white object-contain"
          />
          {{ league.name }}
        </button>
      </div>
    </div>

    <div>
      <label for="team-search" class="mb-2 block text-sm font-medium text-slate-500">
        Поиск команды
      </label>
      <input
        id="team-search"
        v-model="search"
        type="search"
        placeholder="Например, Arsenal"
        autocomplete="off"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none sm:max-w-sm"
      />
    </div>

    <div aria-live="polite">
      <p v-if="teamsLoading" class="text-slate-500">Загрузка команд…</p>
      <p v-else-if="teamsError" role="alert" class="text-red-700">{{ teamsError.message }}</p>
      <p v-else-if="filteredTeams.length === 0" class="text-slate-500">Ничего не найдено</p>
      <ul v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="team in filteredTeams" :key="team.id">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-emerald-600 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
            @click="chooseTeam(team.id)"
          >
            <img
              v-if="team.crest"
              :src="team.crest"
              alt=""
              loading="lazy"
              class="size-10 shrink-0 object-contain"
            />
            <span class="min-w-0">
              <span class="block truncate font-medium">{{ team.name }}</span>
              <span class="block text-sm text-slate-500">{{ team.tla }}</span>
            </span>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>
