<script setup lang="ts">
defineProps<{
  teamId: number
}>()
</script>

<template>
  <section>
    <h2 class="text-2xl font-semibold">Обзор команды</h2>
    <p class="mt-2 text-slate-600">
      Логотип, ближайший матч, последний результат и форма появятся здесь.
    </p>
  </section>
</template>
