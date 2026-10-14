<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex h-14 max-w-5xl items-center px-4">
        <h1 class="text-xl font-bold tracking-tight text-emerald-700">
          <RouterLink to="/">Fanboard</RouterLink>
        </h1>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
