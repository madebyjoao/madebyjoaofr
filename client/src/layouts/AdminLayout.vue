<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <
  <div class="h-dvh overflow-hidden grid grid-cols-[220px_1fr] grid-rows-[auto_1fr]">

    
    <aside class="row-span-2 flex flex-col gap-2 p-4 bg-zinc-900 text-zinc-100">
      <p class="font-bold mb-4">Admin</p>
      <RouterLink :to="{ name: 'admin-dashboard' }">Dashboard</RouterLink>
      <RouterLink :to="{ name: 'admin-users' }">Users</RouterLink>
      <RouterLink :to="{ name: 'home' }" class="mt-auto">← Back to site</RouterLink>
    </aside>


    <header class="flex items-center justify-end gap-4 px-6 py-3 border-b">
      <span>joao@madebyjoao.fr</span>
    </header>

    <main class="min-h-0 overflow-y-auto p-6">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
aside a.router-link-exact-active {
  font-weight: 700;
}
</style>
