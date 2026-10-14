<script setup lang="ts">
defineProps<{
  teamId: number
}>()
</script>

<template>
  <div>
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
