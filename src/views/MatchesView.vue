<script setup lang="ts">
defineProps<{
  teamId: number
}>()
</script>

<template>
  <section>
    <h2 class="text-2xl font-semibold">Матчи</h2>
    <p class="mt-2 text-slate-600">Прошедшие и предстоящие игры сезона появятся здесь.</p>
  </section>
</template>
