<script setup lang="ts">
import { computed } from 'vue'
import { useTeamStandings } from '@/composables/useTeamStandings'

const props = defineProps<{
  teamId: number
}>()

const {
  isLoading: standingsLoading,
  error: standingsError,
  competition,
  table,
} = useTeamStandings(() => props.teamId)

const teamRow = computed(() => {
  return table.value.find((row) => row.team.id === props.teamId) ?? null
})
</script>

<template>
  <section aria-labelledby="standings-title" class="space-y-4">
    <p v-if="standingsLoading" class="text-slate-500">Загрузка таблицы…</p>
    <p v-else-if="standingsError" role="alert" class="text-red-700">
      {{ standingsError.message }}
    </p>
    <p v-else-if="!competition" class="text-slate-500">
      Команда сейчас не участвует в национальном чемпионате.
    </p>

    <template v-else>
      <div class="flex items-center gap-3">
        <img
          v-if="competition.emblem"
          :src="competition.emblem"
          alt=""
          class="size-8 object-contain"
        />
        <h3 id="standings-title" class="text-xl font-semibold">{{ competition.name }}</h3>
      </div>

      <div
        v-if="teamRow"
        class="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5"
      >
        <div>
          <div class="text-sm text-emerald-800">Место</div>
          <div class="text-4xl font-bold text-emerald-700 tabular-nums">{{ teamRow.position }}</div>
        </div>
        <dl class="grid grid-cols-3 gap-x-6 gap-y-1 text-sm sm:grid-cols-5">
          <div>
            <dt class="text-slate-500">Очки</dt>
            <dd class="text-lg font-semibold tabular-nums">{{ teamRow.points }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">Игры</dt>
            <dd class="text-lg font-semibold tabular-nums">{{ teamRow.playedGames }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">В / Н / П</dt>
            <dd class="text-lg font-semibold tabular-nums">
              {{ teamRow.won }} / {{ teamRow.draw }} / {{ teamRow.lost }}
            </dd>
          </div>
          <div>
            <dt class="text-slate-500">Мячи</dt>
            <dd class="text-lg font-semibold tabular-nums">
              {{ teamRow.goalsFor }}:{{ teamRow.goalsAgainst }}
            </dd>
          </div>
          <div>
            <dt class="text-slate-500">Разница</dt>
            <dd class="text-lg font-semibold tabular-nums">
              {{ teamRow.goalDifference > 0 ? '+' : '' }}{{ teamRow.goalDifference }}
            </dd>
          </div>
        </dl>
      </div>

      <p v-if="table.length === 0" class="text-slate-500">Таблица пока недоступна.</p>
      <div v-else class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table class="w-full text-sm">
          <caption class="sr-only">
            Турнирная таблица:
            {{
              competition.name
            }}
          </caption>
          <thead class="border-b border-slate-200 text-xs text-slate-500">
            <tr>
              <th scope="col" class="w-10 px-3 py-2 text-right font-medium">#</th>
              <th scope="col" class="px-3 py-2 text-left font-medium">Команда</th>
              <th scope="col" class="px-2 py-2 text-right font-medium">
                <abbr title="Игры" class="no-underline">И</abbr>
              </th>
              <th scope="col" class="hidden px-2 py-2 text-right font-medium sm:table-cell">
                <abbr title="Победы" class="no-underline">В</abbr>
              </th>
              <th scope="col" class="hidden px-2 py-2 text-right font-medium sm:table-cell">
                <abbr title="Ничьи" class="no-underline">Н</abbr>
              </th>
              <th scope="col" class="hidden px-2 py-2 text-right font-medium sm:table-cell">
                <abbr title="Поражения" class="no-underline">П</abbr>
              </th>
              <th scope="col" class="hidden px-2 py-2 text-right font-medium md:table-cell">
                Мячи
              </th>
              <th scope="col" class="px-2 py-2 text-right font-medium">
                <abbr title="Разница мячей" class="no-underline">РМ</abbr>
              </th>
              <th scope="col" class="px-3 py-2 text-right font-medium">
                <abbr title="Очки" class="no-underline">О</abbr>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="row in table"
              :key="row.team.id"
              :class="row.team.id === teamId ? 'bg-emerald-50 font-semibold' : ''"
              :aria-current="row.team.id === teamId ? 'true' : undefined"
            >
              <td class="px-3 py-2 text-right text-slate-500 tabular-nums">{{ row.position }}</td>
              <td class="px-3 py-2">
                <span class="flex min-w-0 items-center gap-2">
                  <img
                    v-if="row.team.crest"
                    :src="row.team.crest"
                    alt=""
                    loading="lazy"
                    class="size-5 shrink-0 object-contain"
                  />
                  <span class="truncate">{{ row.team.shortName }}</span>
                </span>
              </td>
              <td class="px-2 py-2 text-right tabular-nums">{{ row.playedGames }}</td>
              <td class="hidden px-2 py-2 text-right tabular-nums sm:table-cell">{{ row.won }}</td>
              <td class="hidden px-2 py-2 text-right tabular-nums sm:table-cell">{{ row.draw }}</td>
              <td class="hidden px-2 py-2 text-right tabular-nums sm:table-cell">{{ row.lost }}</td>
              <td class="hidden px-2 py-2 text-right tabular-nums md:table-cell">
                {{ row.goalsFor }}:{{ row.goalsAgainst }}
              </td>
              <td class="px-2 py-2 text-right tabular-nums">
                {{ row.goalDifference > 0 ? '+' : '' }}{{ row.goalDifference }}
              </td>
              <td class="px-3 py-2 text-right font-semibold tabular-nums">{{ row.points }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>
